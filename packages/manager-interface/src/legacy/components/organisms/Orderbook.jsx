import React from 'react';
import BigNumber from 'bignumber.js';
import { Grid, Image } from 'semantic-ui-react';
import displayNumber from '../../utils/displayNumber';

const getBuyRowStyle = (
  cumulativeVolume,
  totalVolume,
  isReadyToTrade,
  isLast,
) => {
  const percentage = new BigNumber(cumulativeVolume)
    .div(totalVolume)
    .times(100);
  const reverse = new BigNumber(100).minus(percentage);
  return {
    background: `linear-gradient(to right, rgba(201, 88, 88,0) 0%, rgba(201, 88, 88,0) ${reverse}%, rgba(201, 88, 88,0.3) ${reverse}%, rgba(201, 88, 88,0.3) 100%)`,
    cursor: isReadyToTrade ? 'pointer' : 'auto',
    padding: 0,
    borderBottom: isLast ? 'none' : '1px solid rgba(34, 36, 38, 0.15)',
  };
};

const getSellRowStyle = (
  cumulativeVolume,
  totalVolume,
  isReadyToTrade,
  isLast,
) => {
  const percentage = new BigNumber(cumulativeVolume)
    .div(totalVolume)
    .times(100);
  return {
    background: `linear-gradient(to right, rgba(71, 161, 71,0.3) 0%, rgba(71, 161, 71,0.3) ${percentage}%, rgba(71, 161, 71,0) ${percentage}%, rgba(71, 161, 71,0) 100%)`,
    cursor: isReadyToTrade ? 'pointer' : 'auto',
    padding: 0,
    borderBottom: isLast ? 'none' : '1px solid rgba(34, 36, 38, 0.15)',
  };
};

const onMouseOver = e => {
  e.currentTarget.style.backgroundColor = 'rgb(240, 240, 240)';
};

const onMouseOut = e => {
  e.currentTarget.style.backgroundColor = 'initial';
};

const rowInteraction = {
  onMouseOver,
  onMouseOut,
  onFocus: onMouseOver,
  onBlur: onMouseOut,
};

const tableBuyHeadCellStyle = {
  fontWeight: 'bold',
  marginTop: 5,
  marginBottom: 5,
};

const tableSellHeadCellStyle = {
  ...tableBuyHeadCellStyle,
  textAlign: 'right',
};

const tableBuyCellStyle = {
  marginTop: 2,
  marginBottom: 2,
};

const tableSellCellStyle = {
  ...tableBuyCellStyle,
  textAlign: 'right',
};

const Orderbook = ({
  orderbook,
  buyOrders = [],
  sellOrders = [],
  totalSellVolume,
  totalBuyVolume,
  baseToken,
  quoteToken,
  onClick,
  isReadyToTrade,
  loading,
}) => (
  <div id="orderbook">
    <h3 className="App-intro">
      Orderbook for {baseToken}/{quoteToken}
    </h3>
    {loading ? (
      <div>
        <Image src="/static/melon-spinner.gif" size="small" centered />
      </div>
    ) : (
      <React.Fragment>
        <Grid
          padded={false}
          container
          columns={2}
          style={{ marginTop: 30, marginBottom: 30 }}
        >
          <Grid.Column id="SellOrders">
            <Grid padded={false}>
              <Grid.Row
                columns={3}
                style={{
                  padding: 0,
                  borderBottom: '1px solid rgba(34, 36, 38, 0.15)',
                }}
              >
                <Grid.Column style={tableSellHeadCellStyle}>
                  Cum. Vol.
                </Grid.Column>
                <Grid.Column style={tableSellHeadCellStyle}>Vol.</Grid.Column>
                <Grid.Column style={tableSellHeadCellStyle}>Bid</Grid.Column>
              </Grid.Row>
              {orderbook &&
                orderbook.buyEntries.map((entry, index, { length }) => (
                  <Grid.Row
                    style={getBuyRowStyle(
                      entry.volume,
                      orderbook.totalBuyVolume,
                      isReadyToTrade,
                      index + 1 === length,
                    )}
                    key={entry.order.id}
                    {...rowInteraction}
                    onClick={() =>
                      isReadyToTrade
                        ? onClick(orderbook.buyEntries.slice(0, index + 1))
                        : null
                    }
                    columns={3}
                  >
                    <Grid.Column style={tableSellCellStyle}>
                      {displayNumber(entry.volume)}
                    </Grid.Column>
                    <Grid.Column style={tableSellCellStyle}>
                      {displayNumber(entry.order.buy.howMuch)}
                    </Grid.Column>
                    <Grid.Column style={tableSellCellStyle}>
                      {displayNumber(entry.order.price)}
                    </Grid.Column>
                  </Grid.Row>
                ))}
            </Grid>
          </Grid.Column>
          <Grid.Column id="BuyOrders" style={{ marginLeft: -1 }}>
            <Grid padded={false}>
              <Grid.Row
                columns={3}
                style={{
                  padding: 0,
                  borderBottom: '1px solid rgba(34, 36, 38, 0.15)',
                }}
              >
                <Grid.Column style={tableBuyHeadCellStyle}>Ask</Grid.Column>
                <Grid.Column style={tableBuyHeadCellStyle}>Vol.</Grid.Column>
                <Grid.Column style={tableBuyHeadCellStyle}>
                  Cum. Vol.
                </Grid.Column>
              </Grid.Row>

              {orderbook &&
                orderbook.sellEntries.map((entry, index, { length }) => (
                  <Grid.Row
                    style={getSellRowStyle(
                      entry.volume,
                      orderbook.totalBuyVolume,
                      isReadyToTrade,
                      index + 1 === length,
                    )}
                    {...rowInteraction}
                    key={entry.order.id}
                    onClick={() =>
                      isReadyToTrade
                        ? onClick(orderbook.sellEntries.slice(0, index + 1))
                        : null
                    }
                    columns={3}
                  >
                    <Grid.Column style={tableBuyCellStyle}>
                      {displayNumber(entry.order.price)}
                    </Grid.Column>
                    <Grid.Column style={tableBuyCellStyle}>
                      {displayNumber(entry.order.sell.howMuch)}
                    </Grid.Column>
                    <Grid.Column style={tableBuyCellStyle}>
                      {displayNumber(entry.volume)}
                    </Grid.Column>
                  </Grid.Row>
                ))}
            </Grid>
          </Grid.Column>
        </Grid>
        {orderbook &&
        orderbook.sellEntries.length === 0 &&
        orderbook.buyEntries.length === 0 ? (
          <h4 style={{ marginBottom: 50, color: '#f29954' }}>
            No orders on the orderbook for this trading pair
          </h4>
        ) : null}
      </React.Fragment>
    )}
  </div>
);

export default Orderbook;
