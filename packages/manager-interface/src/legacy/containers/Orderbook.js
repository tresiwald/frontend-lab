import { connect } from 'react-redux';
import { compose } from 'recompose';
import Orderbook from '../components/organisms/Orderbook';
import React from 'react';
import { Subscription } from 'react-apollo';
import gql from 'graphql-tag';

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
          }

          price
          sell {
            howMuch
          }

          buy {
            howMuch
          }
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
          }

          price
          sell {
            howMuch
          }
        }
      }
    }
  }
`;

const withState = connect(state => ({
  baseToken: state.app.assetPair.base,
  quoteToken: state.app.assetPair.quote,
  isReadyToTrade: state.app.isReadyToTrade,
}));

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
