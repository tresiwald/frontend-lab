import { Template } from "meteor/templating";
import { Session } from "meteor/session";
import { setup, getConfig, transferTo } from "@melonproject/melon.js";
import Web3 from "web3";
import callWithPromise from "../api/callWithPromise.js";
import "./dashboard.html";

Template.dashboard.helpers({
  ethBalance() {
    return Session.get("ethBalance");
  },
  mlnBalance() {
    return Session.get("mlnBalance");
  }
});

Template.dashboard.events({
  "click .btn": async (event, instance) => {
    let captchaData = grecaptcha.getResponse();
    let defaultAccount = web3.eth.accounts[0];
    if (!web3.isAddress(defaultAccount)) {
      toastr.error(
        "Your Ethereum address cannot be retrieved. Please check if your Ethereum client is valid and working",
        "Error"
      );
      return;
    }
    grecaptcha.reset();
    try {
      toastr.info("Please Wait");
      let res = await callWithPromise(
        "faucetRequest",
        captchaData,
        defaultAccount
      );
      toastr.success(
        "You have received 2.5 Kovan ETH and 2.5 Kovan MLN!",
        "Success"
      );
    } catch (error) {
      toastr.error("Please try again", error.reason);
    }
  }
});
