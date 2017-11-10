import { HTTP } from "meteor/http";

const privateKey = "6LfihjAUAAAAAGSJTMXRTx_Z9t8oyQ7oV37bgEGw";

const verifyCaptcha = (response, remoteip) => {
  try {
    let result = HTTP.call(
      "POST",
      "https://www.google.com/recaptcha/api/siteverify",
      {
        params: { secret: privateKey, response: response, remoteip: remoteip }
      }
    );
    return JSON.parse(result.content)["success"];
  } catch (e) {
    return false;
  }
};

export default verifyCaptcha;
