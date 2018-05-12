import { connect } from 'react-redux';
import { compose } from 'recompose';
import Orderbook from '../components/organisms/Orderbook';
import React from 'react';
import { Subscription } from 'react-apollo';
import gql from 'graphql-tag';
import { actions } from '../actions/orderbook';

const subscription = gql`
  subscription OrderbookQuery($baseToken: Symbol!, $quoteToken: Symbol!) {
    orderbook(baseTokenSymbol: $baseToken, quoteTokenSymbol: $quoteToken) {
      totalBuyVolume
      totalSellVolume
      buyEntries {
        volume
        order {
          ... on OasisDexOrder {
            id
          }

          ... on ZeroExOrder {
            id: salt
            expiration
            feeRecipient
            makerFee
            takerFee
            salt
            signature {
              v
              r
              s
            }
          }

          price
          sell {
            howMuch
            symbol
          }

          buy {
            howMuch
            symbol
          }
          type
          exchange
          exchangeContractAddress
          isActive
        }
      }
      sellEntries {
        volume
        order {
          ... on OasisDexOrder {
            id
          }

          ... on ZeroExOrder {
            id: salt
            expiration
            feeRecipient
            makerFee
            takerFee
            salt
            signature {
              v
              r
              s
            }
          }

          price
          buy {
            howMuch
            symbol
          }
          sell {
            howMuch
            symbol
          }
          type
          exchange
          exchangeContractAddress
          isActive
        }
      }
    }
  }
`;

const mapDispatchToProps = dispatch => ({
  onClick: orders => {
    dispatch(actions.selectOrder(orders));
  },
});

const mapStateToProps = state => ({
  baseToken: state.app.assetPair.base,
  quoteToken: state.app.assetPair.quote,
  isReadyToTrade: state.app.isReadyToTrade,
});

const withState = connect(mapStateToProps, mapDispatchToProps);

const withSubscription = BaseComponent => baseProps => (
  <Subscription
    subscription={subscription}
    variables={{
      // @TODO: Why is the "empty" value for this "..."?
      baseToken: baseProps.baseToken !== '...' && baseProps.baseToken,
      quoteToken: baseProps.quoteToken !== '...' && baseProps.quoteToken,
    }}
  >
    {props => (
      <BaseComponent
        {...baseProps}
        orderbook={props.data && props.data.orderbook}
        loading={props.loading}
      />
    )}
  </Subscription>
);

export default compose(withState, withSubscription)(Orderbook);
