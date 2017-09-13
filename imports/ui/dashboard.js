import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Promise } from 'meteor/promise';
import { Session } from 'meteor/session'
import Web3 from 'web3';
import BigNumber from "bignumber.js";
import { setup, getConfig, transferTo} from '@melonproject/melon.js';
import './dashboard.html';

Template.dashboard.helpers({
  ethBalance() {
    return Session.get('ethBalance');
  },
  mlnBalance() {
    return Session.get('mlnBalance');
  },
});

Template.dashboard.events({
  'click .btn': async (event, instance) => {
    let captchaData = grecaptcha.getResponse();
    let defaultAccount = web3.eth.accounts[0];
    Meteor.call('faucetRequest', captchaData, defaultAccount, function(error, result) {
      grecaptcha.reset();
      if (error) {
        toastr.error('Please try again', error.reason)
      } else {
        toastr.success('You will receive 1 Kovan ETH and 10 Kovan MLN!', 'Success')
      }
    });
  },
});
