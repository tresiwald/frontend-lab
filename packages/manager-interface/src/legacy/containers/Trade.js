import { connect } from 'react-redux';
import { reduxForm, change, formValueSelector } from 'redux-form';
import { actions } from '../actions/trade';
import Trade from '../components/organisms/Trade';
import {
  multiply,
  divide,
  greaterThan,
  max,
  min,
} from '../utils/functionalBigNumber';
import displayNumber from '../utils/displayNumber';

const selector = formValueSelector('trade');

const mapStateToProps = state => ({
  loading: state.app.transactionInProgress,
  baseTokenSymbol: state.app.assetPair.base,
  quoteTokenSymbol: state.app.assetPair.quote,
  orderType: selector(state, 'type'),
  theirOrderType: selector(state, 'type') === 'Buy' ? 'Sell' : 'Buy',
  selectedOrder: state.orderbook.selectedOrder,
  quoteTokenBalance: state.holdings.holdings.length
    ? state.holdings.holdings.find(a => a.name === state.app.assetPair.quote)
        .balance
    : undefined,
  baseTokenBalance: state.holdings.holdings.length
    ? state.holdings.holdings.find(a => a.name === state.app.assetPair.base)
        .balance
    : undefined,
  initialValues: {
    strategy: 'Market',
    type: 'Buy',
  },
  dataValid: state.ethereum.isDataValid,
  strategy: selector(state, 'strategy'),
});

const onSubmit = (values, dispatch) => {
  if (values.strategy === 'Market') {
    dispatch(actions.takeOrder(values));
  } else {
    dispatch(actions.placeOrder(values));
  }
};

const onChange = (values, dispatch, props, previousValues) => {
  const changed = Object.keys(values).reduce(
    (acc, key) => (values[key] !== previousValues[key] ? [key, ...acc] : acc),
    [],
  );

  // Only correct if only one field is changed (i.e. the user is in the form)
  // More than one changes come from the click on the orderbook for example.
  // Furthermore: Only dispatch a change if there is actually a change to avoid
  // infinite loop
  if (changed.length === 1) {
    const field = changed[0];

    if (field === 'strategy' && previousValues.strategy === 'Limit') {
      props.reset();
    }

    let maxTotal;
    let maxQuantity;
    if (values.strategy === 'Market') {
      maxTotal =
        values.type === 'Buy'
          ? min(props.quoteTokenBalance, values.total)
          : values.total;
      maxQuantity =
        values.type === 'Sell'
          ? max(props.baseTokenBalance, values.quantity)
          : values.quantity;
    } else if (values.strategy === 'Limit') {
      maxTotal = values.type === 'Buy' ? props.quoteTokenBalance : Infinity;
      maxQuantity = values.type === 'Sell' ? props.baseTokenBalance : Infinity;
    }

    if (field === 'total') {
      if (greaterThan(values.total, maxTotal)) {
        dispatch(change('trade', 'total', maxTotal));
      } else if (values.price) {
        const quantity = divide(values.total, values.price);

        if (values.quantity !== quantity)
          dispatch(change('trade', 'quantity', displayNumber(quantity)));
      }
    }

    if (field === 'quantity') {
      if (greaterThan(values.quantity, maxQuantity)) {
        dispatch(change('trade', 'quantity', maxQuantity));
      } else if (values.price) {
        const total = multiply(values.quantity, values.price);
        if (values.total !== total)
          dispatch(change('trade', 'total', displayNumber(total)));
      }
    }

    if (field === 'price') {
      dispatch(
        change('trade', 'total', multiply(values.quantity, values.price)),
      );
    }
  }
};

const TradeForm = reduxForm({
  form: 'trade',
  onSubmit,
  onChange,
})(Trade);

const TradeRedux = connect(mapStateToProps)(TradeForm);

export default TradeRedux;
