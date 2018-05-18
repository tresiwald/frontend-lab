import { getParityProvider, getPrice, getRanking } from '@melonproject/melon.js';
import { Context } from '../index';

const price = async (parent, args, context: Context) => {
  const environment = await getParityProvider();
  return getPrice(environment, args.symbol);
};

const ranking = async (parent, args, context: Context) => {
  const environment = await getParityProvider();
  return getRanking(environment);
};

export default {
  price,
  ranking,
};
