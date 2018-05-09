import dynamic, { DynamicOptions } from 'next/dynamic';
import React, { ComponentType } from 'react';

const withApollo = (BaseComponent: ComponentType<any>) => {
  const options: DynamicOptions<any, any> = {
    ssr: false,
    modules: props => {
      const {
        api = {
          remote: JSON.parse(process.env.GRAPHQL_REMOTE as string),
          ws: process.env.GRAPHQL_REMOTE_WS as string,
          http: process.env.GRAPHQL_REMOTE_HTTP as string,
        },
      } = props;

      const hoc = api.remote
        ? import('./remote/index').then(m => m.default(api.http, api.ws))
        : import('./local/index').then(m => m.default);

      const component = hoc.then(enhance => enhance(BaseComponent));

      return {
        EnhancedComponent: component,
      };
    },
    render: (props, { EnhancedComponent }) => <EnhancedComponent {...props} />,
  };

  // TODO: This is obviously incorrect (options is not of type "Promise<ComponentType<any>>").
  // This requires a fix in the ustream next.js code to fix the typing on dynamic().
  return dynamic(options as Promise<ComponentType<any>>);
};

export default withApollo;
