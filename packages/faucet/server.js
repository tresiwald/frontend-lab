const compression = require('compression');
const nextApp = require('next');
const express = require('express');
const bodyParser = require('body-parser');
const Recaptcha = require('express-recaptcha').Recaptcha;

const recaptcha = new Recaptcha(
  process.env.RECAPTCHA_SITE_KEY,
  process.env.RECAPTCHA_SECRET_KEY,
);

const dev = process.env.NODE_ENV !== 'production';
const app = nextApp({ dir: 'src', dev });

app.prepare().then(() => {
  const server = express();
  const handle = app.getRequestHandler();

  if (process.env.NODE_ENV === 'production') {
    // Add gzip compression.
    server.use(compression());
  }

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded());

  server.get('/', (req, res) => {
    res.recaptcha = recaptcha.render();
    return handle(req, res);
  });

  server.post('/', (req, res) => {
    recaptcha.verify(req, (error, data) => {
      if (!error) {
        console.log('error');
      } else {
        console.log('success');
      }
    });
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(process.env.PORT);
});
