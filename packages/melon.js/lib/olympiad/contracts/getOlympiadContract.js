import OlympiadContract from '@melonproject/protocol/out/Competition.abi.json';
import getConfig from '../../version/calls/getConfig';

/**
 * Gets contract instance of deployed canonical Pricefeed
 */
const getOlympiadContract = async environment => {
  const config = await getConfig(environment);
  return environment.api.newContract(OlympiadContract, config.olympiadAddress);
};

export default getOlympiadContract;
