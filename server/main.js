import { Meteor } from "meteor/meteor";
import { setup, getBalance, transferTo } from "@melonproject/melon.js";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import verifyCaptcha from "../imports/api/verifyCaptcha.js";

const fundingNode = "0x00c9D604ccF4Ed3f9cF735e9c3dea921F714B66F";
const maxRequestsPerDay = 3;

// Saving requesting ethereum address and IP address to limit faucet requests
let Requests = new Meteor.Collection("Requests");
Requests._ensureIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });

if (typeof web3 === "undefined")
  web3 = new Web3(new Web3.providers.HttpProvider("http://172.17.0.1:8545"));

setup.init({
  web3,
  daemonAddress: fundingNode,
  defaultAccount: fundingNode,
  tracer: ({ timestamp, message, category }) => {
    console.log(timestamp.toISOString(), `[${category}]`, message);
  }
});

Meteor.methods({
  faucetRequest: async function(response, address) {
    const clientIP = this.connection.clientAddress;
    const count = await Requests.find({
      $or: [{ ethereumAddress: address }, { ipAddress: clientIP }]
    }).count();
    // Check for Request Limits
    if (count >= maxRequestsPerDay) {
      throw new Meteor.Error(
        400,
        "You can have already requested more than twice in the last 24 hours. Please try again later"
      );
    }
    // Verify Captcha
    if (!verifyCaptcha(response, clientIP)) {
      throw new Meteor.Error(400, "Captcha Error");
    }
    // Transfer MLN-T and K-ETH
    try {
      await transferTo("MLN-T", address, 2.5);
      const amount = await web3.toWei(2.5, "ether");
      await web3.eth.sendTransaction({
        from: fundingNode,
        to: address,
        value: amount
      });
      Requests.insert({ createdAt: new Date(), ethereumAddress: address, ipAddress: clientIP });
    } catch (e) {
      throw new Meteor.Error(400, "Transaction Error");
    }
  }
});
