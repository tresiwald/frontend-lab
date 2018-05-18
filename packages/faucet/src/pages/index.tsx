import React from 'react';
import axios from 'axios';

export default class extends React.Component {
  public static getInitialProps(context) {
    return {
      recaptcha: context.res.recaptcha,
    };
  }

  handleSubmit = event => {
    const captcha = document.getElementById('g-recaptcha-response').value;
    axios.post('/', {
      'g-recaptcha-response': captcha,
    });

    event.preventDefault();
  };

  render() {
    const { recaptcha } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <div dangerouslySetInnerHTML={{ __html: recaptcha }} />
        <button type="submit">Request</button>
      </form>
    );
  }
}
