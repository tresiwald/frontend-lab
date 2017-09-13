import '/imports/ui/dashboard';
import '/imports/ui/captcha';
import Web3 from 'web3';
import { setup, getBalance } from '@melonproject/melon.js';

Meteor.startup(function() {

  setup.init({ web3, daemonAddress: Meteor.settings.public.DAEMON_ADDRESS });
  //Watch and Update Balances
  web3.eth.filter('latest').watch(function(error) {
    if(!error) {
      let defaultAccount = web3.eth.accounts[0];
      getBalance('MLN-T', defaultAccount)
      .then(mlnBalance => {
        Session.set('mlnBalance', mlnBalance.toNumber());
        //Doesn't seem to support then without callback
        web3.eth.getBalance(defaultAccount, (err, res) => {
          if (!err) {
            let etherBalance = web3.fromWei(res, 'ether')
            Session.set('ethBalance', etherBalance.toNumber());
          }
        });
      });
    }
  });
});
