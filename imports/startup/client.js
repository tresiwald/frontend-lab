
import '/imports/ui/dashboard';
import { Session } from "meteor/session";

const publicKey = "6LfihjAUAAAAADo3-U5liH1s0KS16HJCMBdnb4_J";

Meteor.startup(function() {  
  reCAPTCHA.config({
      publickey: publicKey,
  });
});

Router.route('/', function() {
  this.render('dashboard')
})

Router.route('/:address', function() {
  Session.set('address', Router.current().params.address)
  this.render('dashboard')
})
