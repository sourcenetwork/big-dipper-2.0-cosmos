# Source Big Dipper 2.0

This repository is a fork of Forbole's Big Dipper, a block explorer for cosmos chains.
It's been modified to track only SourceHub networks.

## Building and running

The repository contains a Dockerfile which can be used to run a production build of BigDipper.

The following environment variables can be set at runtime to configure the data source endpoints:

```
HASURA_GRAPHQL=http://10.42.0.72:8080/v1/graphql
HASURA_GRAPHQL_WS=ws://10.42.0.72:8080/v1/graphql
CHAIN_RPC_WS=ws://10.42.0.87:26657/websocket
```

HASURA_GRAPHQL: http endpoint for the Hasura GraphQL API (as defined by Callisto)
HASURA_GRAPHQL_WS: websocket endpoint for the Hasura GraphQL API (as defined by Callisto)
CHAIN_RPC_WS: Websocket address for the CometBFT RPC API of a node from the chain which is being tracked. See [JSONRPC/websockets
](https://docs.cometbft.com/v0.34/rpc/)

## Adding SourceHub chains

There are two primary files which developers should modify to track different instances of SourceHub.

[chain.json](apps/web/src/chain.json)
[networks menu](packages/ui/src/hooks/useBigDipperNetworks/index.ts)

## Credits

Original repository: https://github.com/forbole/big-dipper-2.0-cosmos

## Licensing

big-dipper-2.0 is an Apache lincensed product.
