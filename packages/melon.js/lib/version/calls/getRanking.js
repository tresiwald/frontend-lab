import getConfig from '../../version/calls/getConfig';
import getFundContract from '../../fund/contracts/getFundContract';
import getRankingContract from '../contracts/getRankingContract';
import toReadable from '../../assets/utils/toReadable';
import toDate from '../../utils/generic/toDate';

/**
 * Returns an array of all existing funds on current Version, sorted by share price in descending order, with informations such as address, name, share price, and inception date.
 */
const getRanking = async environment => {
  const config = await getConfig(environment);
  const rankingContract = await getRankingContract(environment);
  const { versionAddress } = config;
  const [fundAddresses, fundSharePrices, fundInceptions, fundNames] = await rankingContract.instance.getFundDetails.call(
    {},
    [versionAddress],
  );

  console.log(fundAddresses, fundSharePrices);
  // let ranking = [];
  // /* eslint-disable no-underscore-dangle */
  // const fundAddresses = output[0].map(fund => fund._value);
  // const fundSharePrices = output[1].map(fund =>
  //   toReadable(config, fund._value, config.quoteAssetSymbol).toNumber(),
  // );
  // const fundInceptions = output[2].map(fund => fund._value);
  // /* eslint-enable */

  // const unsortedFunds = await Promise.all(getRankingPromises);
  // return unsortedFunds.sort((a, b) => (a.sharePrice > b.sharePrice ? -1 : 1));
  return [];
};

export default getRanking;
