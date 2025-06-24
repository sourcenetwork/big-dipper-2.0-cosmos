import chainConfig from '@/chainConfig';
import { ChainIdQuery, useChainIdQuery } from '@/graphql/types/general_types';
import { BigDipperNetwork, zBigDipperNetwork } from '@/models/bigDipperNetwork';
import { gql, makeVar, useQuery, useReactiveVar } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import z from 'zod';

const networks = {
  networks: [
    {
      name: 'SourceHub',
      logo: 'https://raw.githubusercontent.com/forbole/big-dipper-networks/main/logos/desmos.svg?sanitize=true',
      cover:
        'https://raw.githubusercontent.com/forbole/big-dipper-networks/main/covers/desmos.png?sanitize=true',
      links: [
        {
          name: 'Devnet',
          chain_id: 'devnet',
          url: 'https://github.com/sourcenetwork/sourcehub',
        },
      ],
    },
  ],
};

// Get the chain ID from a GraphQL query response
const mapChainIdToModel = (data?: ChainIdQuery) => data?.genesis?.[0]?.chainId ?? '';

// Define a Zod schema for the query data
export const zQuery = z.object({
  networks: z
    .array(
      z.object({
        name: z.coerce.string().default('').catch(''),
        logo: z.coerce.string().default('').catch(''),
        links: z
          .array(
            z.object({
              chain_id: z.coerce.string().default('').catch(''),
              name: z.coerce.string().default('').catch(''),
              url: z.coerce.string().default('').catch(''),
            })
          )
          .catch([]),
      })
    )
    .optional(),
});
export type Query = z.infer<typeof zQuery>;

// Sort the networks data alphabetically by name
const mapQueryToModel = (data?: Query) =>
  zQuery
    .parse(data)
    ?.networks?.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'accent' }))
    .map((l) => zBigDipperNetwork.parse(l)) ?? [];

function useBigDipperNetworks(skipChainId = false) {
  const [chainData, _] = useState(mapQueryToModel(networks));
  const [selectedName, setSelectedName] = useState();

  // Fetch the chain ID using a GraphQL query
  const chainIdQuery = useChainIdQuery({ skip: skipChainId });
  const shouldRefetchChainId = !!chainIdQuery.error && !chainIdQuery.loading;
  const refetchChainId = chainIdQuery.refetch;
  useEffect(() => {
    if (shouldRefetchChainId) refetchChainId();
  }, [shouldRefetchChainId, refetchChainId]);

  const isCompletedChainId = !chainIdQuery.loading && !chainIdQuery.error;
  const dataChainId = chainIdQuery.data;

  // Store the fetched chain ID in the reactive variable when the data is loaded
  useEffect(() => {
    if (isCompletedChainId && dataChainId) setSelectedName(mapChainIdToModel(dataChainId));
  }, [isCompletedChainId, dataChainId]);

  return {
    loading: false,
    error: null,
    networks: chainData,
    setNetworks: noop,
    selectedName,
    setSelectedName,
  };
}

function noop() {}

export default useBigDipperNetworks;
