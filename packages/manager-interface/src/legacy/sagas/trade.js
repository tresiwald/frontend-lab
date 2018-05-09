import { takeLatest, select, call, put } from 'redux-saga/effects';
import {
  makeOrder,
  takeMultipleOrders,
  getPrices,
  deserializeOrder,
  matchOrders,
} from '@melonproject/melon.js';
import { reset } from 'redux-form';
import { types, actions } from '../actions/trade';
import { actions as fundActions } from '../actions/fund';
import { actions as modalActions } from '../actions/modal';
import displayNumber from '../utils/displayNumber';
import signer from './signer';

function* placeOrderSaga(action) {
  const fundAddress = yield select(state => state.fund.address);
  let buyHowMuch;
  let buyWhichToken;
  let sellHowMuch;
  let sellWhichToken;

  if (action.values.type === 'Buy') {
    buyHowMuch = action.values.quantity;
    buyWhichToken = yield select(state => state.app.assetPair.base);
    sellHowMuch = action.values.total;
    sellWhichToken = yield select(state => state.app.assetPair.quote);
  } else if (action.values.type === 'Sell') {
    buyHowMuch = action.values.total;
    buyWhichToken = yield select(state => state.app.assetPair.quote);
    sellHowMuch = action.values.quantity;
    sellWhichToken = yield select(state => state.app.assetPair.base);
  }
  function* transaction(environment) {
    yield call(makeOrder, environment, {
      fundAddress,
      sellWhichToken,
      buyWhichToken,
      sellHowMuch,
      buyHowMuch,
    });
    yield put(actions.placeOrderSucceeded());
    yield put(modalActions.close());
    yield put(reset('trade'));
  }

  yield call(
    signer,
    `Do you really want to place the following limit order:  BUY ${buyHowMuch} ${buyWhichToken} and SELL ${sellHowMuch} ${sellWhichToken}? If yes, please type your password below:`,
    transaction,
    actions.placeOrderFailed,
  );
}

function* takeOrderSaga(action) {
  const fundAddress = yield select(state => state.fund.address);
  const managerAddress = yield select(state => state.ethereum.account);

  const selectedOrderId = yield select(state => state.orderbook.selectedOrder);
  const selectedOrder = yield select(state =>
    state.orderbook.orders.find(o => o.id === selectedOrderId),
  );
  const ourOrderType = action.values.type;
  const theirOrderType = ourOrderType.toLowerCase() === 'buy' ? 'sell' : 'buy';

  let buyHowMuch;
  let buyWhichToken;
  let sellHowMuch;
  let sellWhichToken;
  if (ourOrderType === 'Buy') {
    buyHowMuch = action.values.quantity;
    buyWhichToken = yield select(state => state.app.assetPair.base);
    sellHowMuch = action.values.total;
    sellWhichToken = yield select(state => state.app.assetPair.quote);
  } else if (ourOrderType === 'Sell') {
    buyHowMuch = action.values.total;
    buyWhichToken = yield select(state => state.app.assetPair.quote);
    sellHowMuch = action.values.quantity;
    sellWhichToken = yield select(state => state.app.assetPair.base);
  }

  const priceThreshold = getPrices(selectedOrder)[theirOrderType];

  const buyOrders = yield select(state => state.orderbook.buyOrders);
  const sellOrders = yield select(state => state.orderbook.sellOrders);
  const orders =
    theirOrderType === 'buy'
      ? buyOrders.map(order => deserializeOrder(order))
      : sellOrders.map(order => deserializeOrder(order));

  const matchedOrders = matchOrders(theirOrderType, priceThreshold, orders);
  const quantityAsked = buyHowMuch;

  function* transaction(environment) {
    yield call(takeMultipleOrders, environment, {
      orders: matchedOrders,
      managerAddress,
      fundAddress,
      totalQuantityAsked: quantityAsked,
    });
    yield put(actions.takeOrderSucceeded());
    yield put(modalActions.close());
    yield put(reset('trade'));
    yield put(fundActions.infoRequested(fundAddress));
  }

  yield call(
    signer,
    `Do you really want to place the following market order:  BUY ${displayNumber(
      buyHowMuch,
    )} ${buyWhichToken} and SELL ${displayNumber(
      sellHowMuch,
    )} ${sellWhichToken}? If yes, please type your password below:`,
    transaction,
    actions.takeOrderFailed,
  );
}

function* trade() {
  yield takeLatest(types.PLACE_ORDER_REQUESTED, placeOrderSaga);
  yield takeLatest(types.TAKE_ORDER_REQUESTED, takeOrderSaga);
}

export default trade;
