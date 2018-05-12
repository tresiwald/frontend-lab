export const types = {
  GET_ORDERBOOK_REQUESTED: 'GET_ORDERBOOK_REQUESTED:orderbook:melon.fund',
  GET_ORDERBOOK_SUCCEEDED: 'GET_ORDERBOOK_SUCCEEDED:orderbook:melon.fund',
  GET_ORDERBOOK_FAILED: 'GET_ORDERBOOK_FAILED:orderbook:melon.fund',
  SELECT_ORDER: 'SELECT_ORDER:orderbook:melon.fund',
  SET_LOADING: 'SET_LOADING:orderbook:melon.fund',
};

export const actions = {
  getOrderbook: () => ({
    type: types.GET_ORDERBOOK_REQUESTED,
  }),
  getOrderbookFailed: reason => ({
    type: types.GET_ORDERBOOK_FAILED,
    reason,
  }),
  getOrderbookSucceeded: orderbookData => ({
    type: types.GET_ORDERBOOK_SUCCEEDED,
    ...orderbookData,
  }),
  selectOrder: selectedOrders => ({
    type: types.SELECT_ORDER,
    selectedOrders,
    selectedOrder: selectedOrders[selectedOrders.length - 1].order,
  }),
  setLoading: loading => ({
    type: types.SET_LOADING,
    ...loading,
  }),
};
