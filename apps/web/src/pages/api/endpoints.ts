import chainConfig from '@/chainConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

const config = chainConfig();

type Endpoints = {
  graphql: string;
  graphqlWebsocket: string;
  chainRpcSocket: string;
};

const hasuraGraphqlEndpoints = [
  process.env.HASURA_GRAPHQL,
  config.endpoints.graphql,
  'http://localhost:3000/v1/graphql',
];

const hasuraGraphqlWSEndpoints = [
  process.env.HASURA_GRAPHQL_WS,
  config.endpoints.graphqlWebsocket,
  'ws://localhost:3000/websocket',
];

const chainRPCEndpoints = [
  process.env.CHAIN_RPC_WS,
  config.endpoints.publicRpcWebsocket,
  'http://localhost:26657/websocket',
];

export default function handler(req: NextApiRequest, res: NextApiResponse<Endpoints>) {
  res.status(200).json({
    graphql: hasuraGraphqlEndpoints.find((u) => u),
    graphqlWebsocket: hasuraGraphqlWSEndpoints.find((u) => u),
    chainRpcSocket: chainRPCEndpoints.find((u) => u),
  });
}
