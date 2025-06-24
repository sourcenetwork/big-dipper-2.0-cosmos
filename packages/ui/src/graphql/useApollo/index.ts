import chainConfig from '@/chainConfig';
import {
  ApolloClient,
  DefaultOptions,
  InMemoryCache,
  NormalizedCacheObject,
  split
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { HttpLink } from '@apollo/client/link/http';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { RestLink } from 'apollo-link-rest';
import { Kind, OperationTypeNode } from 'graphql';
import { createClient } from 'graphql-ws';
import { useEffect, useState } from 'react';

const {chainType, extra} = chainConfig();

/* Checking if the code is running on the server or the client. */
const ssrMode = typeof window === 'undefined';


/* A global variable that stores the Apollo Client. */
let globalApolloClient: ApolloClient<NormalizedCacheObject>;

/* Setting the default options for the Apollo Client. */
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  },
};

/* Creating a new HttpBatchLink object. */
function createHttpBatchLink(uri?: string) {
  return new BatchHttpLink({
    uri,
    batchMax: 20,
    batchInterval: 200,
  });
}

/* Creating a new HttpLink object. */
function createHttpLink(uri?: string) {
  return new HttpLink({ uri });
}

/**
 * It creates a WebSocketLink object that connects to the GraphQL server via a WebSocket connection
 * @returns A WebSocketLink object.
 */
function createWebSocketLink(uri?: string) {
  // older version of Hasura doesn't support graphql-ws
  if (extra.graphqlWs) {
    return new GraphQLWsLink(
      createClient({
        url: uri ?? '',
        lazy: true,
        retryAttempts: Infinity,
        retryWait: (_count) => new Promise((r) => setTimeout(() => r(), 1000)),
        shouldRetry: () => true,
        keepAlive: 30 * 1000,
      })
    );
  }

  return new WebSocketLink({
    uri: uri ?? '',
    options: {
      lazy: true,
      reconnect: true,
      reconnectionAttempts: Infinity,
      timeout: 30 * 1000,
      minTimeout: 12 * 1000,
      inactivityTimeout: 30 * 1000,
    },
  });
}

export function profileApi() {
  if (/^testnet/i.test(chainType)) {
    return 'https://gql.morpheus.desmos.network/v1/graphql';
  }
  return 'https://gql.mainnet.desmos.network/v1/graphql';
}

export const BIG_DIPPER_NETWORKS = 'https://raw.githubusercontent.com/forbole/big-dipper-networks/main/';

/**
 * It creates a new Apollo Client, and sets the default options for it
 * @param initialState - The initial state of the cache.
 * @returns A function that takes an initial state and returns an Apollo Client.
 */
async function createApolloClient(initialState = {}) {
  /* Restoring the cache from the initial state. */
  const cache = new InMemoryCache().restore(initialState);

  const restLink = new RestLink({ uri: BIG_DIPPER_NETWORKS });

  const response = await fetch('/api/endpoints');
  const endpoints = await response.json();

  const httpLink =
    // split(
    // ({ operationName }) =>
    //   /^(?:WasmCode|WasmContract|WasmCodeWithByteCode)$/.test(operationName),
    //   createHttpBatchLink('https://gql.juno.forbole.com/v1/graphql'),
    split(
      ({ operationName, variables }) =>
        /^(?:Account|Validator)Delegations$/.test(operationName) && variables?.pagination,
      createHttpLink(endpoints.graphql),
      createHttpBatchLink(endpoints.graphql)
    );
  const httpOrWsLink = ssrMode
    ? createHttpBatchLink(endpoints.graphql)
    : split(
        /* Checking if the query is a subscription. */
        ({ query }) => {
          const node = getMainDefinition(query);
          const isSubscription =
            node.kind === Kind.OPERATION_DEFINITION &&
            node.operation === OperationTypeNode.SUBSCRIPTION;
          return isSubscription;
        },
        createWebSocketLink(endpoints.graphqlWebsocket),
        httpLink
      );

  const graphlqllink = split(
    ({ operationName }) => /^DesmosProfile/.test(operationName),
    createHttpBatchLink(profileApi()),
    httpOrWsLink
  );

  const link = split(
    ({ operationName }) => operationName === 'Rest',
    restLink,
    graphlqllink,
  );

  /* Creating a new Apollo Client. */
  const client = new ApolloClient({
    ssrMode,
    link,
    cache,
  });

  /* Setting the default options for the Apollo Client. */
  client.defaultOptions = defaultOptions;

  return client;
}

/**
 * It initializes the Apollo Client with the initial state and returns the store
 * @param {NormalizedCacheObject} initialState - This is the initial state of the Apollo Client.
 * @returns The Apollo Client instance.
 */
function useApollo(initialState?: NormalizedCacheObject) {
  /* Setting the initial state of the Apollo Client. */
  const [apolloClient, setClient] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (apolloClient) return;
    createApolloClient(initialState).then(setClient).catch(setErr);
  })
  return {apolloClient, err};
}

export default useApollo;
