import '/imports/ui/dashboard';
import '/imports/ui/captcha';
import Web3 from 'web3';
import { setup, getBalance } from '@melonproject/melon.js';

Meteor.startup(function() {
  setup.init({ web3, daemonAddress: Meteor.settings.public.DAEMON_ADDRESS });
  //Watch and Update Balances
  web3.eth.filter('latest').watch(async function(error) {
    if(!error) {
      let defaultAccount = web3.eth.accounts[0];
      if (defaultAccount) {
        const mlnBalance = await getBalance('MLN-T', defaultAccount);
        Session.set('mlnBalance', mlnBalance.toNumber());
        //Doesn't seem to support without callback
        web3.eth.getBalance(defaultAccount, (err, res) => {
          if (!err) {
            const etherBalance = web3.fromWei(res, 'ether')
            Session.set('ethBalance', etherBalance.toNumber());
          }
        });
      }
      else {
        toastr.remove();
        toastr.warning('Could not fetch your account');
      }
    }
  });
});
