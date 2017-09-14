import { Meteor } from 'meteor/meteor';
import { setup, getBalance, transferTo } from '@melonproject/melon.js';
import BigNumber from "bignumber.js";
import Web3 from 'web3';
import verifyCaptcha from '../imports/api/verifyCaptcha.js';

const fundingNode = '0x00c9D604ccF4Ed3f9cF735e9c3dea921F714B66F';

if (typeof web3 === 'undefined')
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

setup.init({ web3, daemonAddress: fundingNode, defaultAccount: fundingNode});

Meteor.methods({
  faucetRequest: async function(response, address) {
    if (verifyCaptcha(response, this.connection.clientAddress)) {
      return transferTo('MLN-T', address, 10)
      .then(transaction => {
        let amount = web3.toWei(0.1, 'ether');
        return web3.eth.sendTransaction({from:fundingNode, to:address, value:amount});
      })
      .then(send => {
        return true;
      })
      .catch(error => {
        throw new Meteor.Error(400, 'Transaction Error');
      });
    }
    else {
      throw new Meteor.Error(400, 'Captcha Error');
    }
  }
});
