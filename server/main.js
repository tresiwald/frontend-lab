import { Meteor } from 'meteor/meteor';
import BigNumber from "bignumber.js";
import Web3 from 'web3';
import verifyCaptcha from '../imports/api/verifyCaptcha.js';
import { setup, getBalance, transferTo } from '@melonproject/melon.js';

const fundingNode = '0x00c9D604ccF4Ed3f9cF735e9c3dea921F714B66F';

if (typeof web3 === 'undefined')
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

setup.init({ web3, daemonAddress: fundingNode, defaultAccount: fundingNode});

Meteor.methods({
  faucetRequest: function(response, address) {
    if (verifyCaptcha(response, this.connection.clientAddress)) {
      transferTo('MLN-T', address, 1)
      .then(transaction => {
        let amount = web3.toWei(1, 'ether');
        return web3.eth.sendTransaction({from:fundingNode, to:address, value:amount});
      })
      .then(send => {
        console.log(send);
        return true;
      })
      .catch(error => {
        throw new Meteor.Error(400, error);
      });
    }
    else {
      throw new Meteor.Error(400, "Captcha Error");
    }
  }
});
