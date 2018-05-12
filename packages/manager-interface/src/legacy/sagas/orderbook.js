import { takeLatest, call, put, select, take } from 'redux-saga/effects';
import {
  getOrderbook,
  deserializeOrder,
  averagePrice,
  getEnvironment,
} from '@melonproject/melon.js';
import { change } from 'redux-form';
import { types, actions } from '../actions/orderbook';
import { types as ethereumTypes } from '../actions/ethereum';
import { min } from '../utils/functionalBigNumber';

function* getOrderbookSaga() {
  const baseTokenSymbol = yield select(state => state.app.assetPair.base);
  const quoteTokenSymbol = yield select(state => state.app.assetPair.quote);

  const isConnected = yield select(state => state.ethereum.isConnected);
  if (!isConnected) yield take(ethereumTypes.HAS_CONNECTED);
  const environment = getEnvironment();
  try {
    yield put(
      actions.setLoading({
        loading: true,
        orders: [],
        buyOrders: [],
        sellOrders: [],
        totalBuyVolume: 0,
        totalSellVolume: 0,
      }),
    );
    const rawOrderbook = yield call(getOrderbook, environment, {
      baseTokenSymbol,
      quoteTokenSymbol,
    });
    const orders = rawOrderbook.map(order => {
      const result = order;
      result.price = order.price.toString();
      result.cumulativeVolume = order.cumulativeVolume.toString();
      result.buy.howMuch = order.buy.howMuch.toString();
      result.sell.howMuch = order.sell.howMuch.toString();
      return result;
    });
    const sellOrders = orders.filter(o => o.type === 'sell').reverse();
    const buyOrders = orders.filter(o => o.type === 'buy');
    const totalSellVolume = buyOrders.length
      ? buyOrders[buyOrders.length - 1].cumulativeVolume
      : 0;
    const totalBuyVolume = sellOrders.length
      ? sellOrders[sellOrders.length - 1].cumulativeVolume
      : 0;
    yield put(actions.setLoading({ loading: false }));
    yield put(
      actions.getOrderbookSucceeded({
        orders,
        sellOrders,
        buyOrders,
        totalSellVolume,
        totalBuyVolume,
      }),
    );
  } catch (err) {
    console.error(err);
    yield put(actions.getOrderbookFailed(err));
  }
}

function* selectOrderSaga(action) {
  const ordersSubset = action.selectedOrders.map(element => ({
    ...element['order'],
    cumulativeVolume: element.volume,
  }));
  const selectedOrder = deserializeOrder({
    ...action.selectedOrders[action.selectedOrders.length - 1]['order'],
    cumulativeVolume:
      action.selectedOrders[action.selectedOrders.length - 1]['volume'],
  });

  const sellTokenSymbol = selectedOrder.buy.symbol;
  const sellTokenBalance = yield select(
    state =>
      state.holdings.holdings.find(h => h.name === sellTokenSymbol).balance,
  );

  try {
    let index;
    let subsetOfOrders;
    let orderType;
    let amount;
    let price;
    let total;

    if (selectedOrder.type === 'buy') {
      orderType = 'Sell';
      const deserializedBuyOrders = ordersSubset.map(order =>
        deserializeOrder(order),
      );
      price = averagePrice('buy', deserializedBuyOrders);
      amount = min(sellTokenBalance, selectedOrder.cumulativeVolume);
      total = price.times(amount);
    } else if (selectedOrder.type === 'sell') {
      orderType = 'Buy';
      const deserializedSellOrders = ordersSubset.map(order =>
        deserializeOrder(order),
      );
      price = averagePrice('sell', deserializedSellOrders);
      total = min(
        sellTokenBalance,
        price.times(selectedOrder.cumulativeVolume),
      );
      amount = total.div(price);
    }

    yield put(change('trade', 'strategy', 'Market'));
    yield put(change('trade', 'quantity', amount));
    yield put(change('trade', 'total', total));
    yield put(change('trade', 'price', price));
    yield put(change('trade', 'type', orderType));
  } catch (err) {
    console.error(err);
  }
}

function* orderbook() {
  yield takeLatest(types.GET_ORDERBOOK_REQUESTED, getOrderbookSaga);
  yield takeLatest(types.SELECT_ORDER, selectOrderSaga);
}

export default orderbook;
