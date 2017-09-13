import { Template } from 'meteor/templating';
import './captcha.html';

const publicKey = "6LfihjAUAAAAADo3-U5liH1s0KS16HJCMBdnb4_J";

Template.captcha.helpers({
  publicKey() {
    return publicKey;
  },
});
