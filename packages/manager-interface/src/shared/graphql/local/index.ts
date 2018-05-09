import { InMemoryCache } from 'apollo-cache-inmemory';
import { createWebWorkerLink } from 'apollo-link-webworker';
import withApollo from 'next-with-apollo';
import WebWorker from './worker';

const worker = new WebWorker();

export default withApollo({
  link: {
    http: () => createWebWorkerLink({ worker }),
    ws: () => createWebWorkerLink({ worker }),
  },
  client: options => ({
    link: options.link,
    cache: new InMemoryCache(),
  }),
});
