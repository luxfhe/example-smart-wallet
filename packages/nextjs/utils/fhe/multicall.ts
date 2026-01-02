/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Abi, AbiStateMutability, ExtractAbiFunction, Address } from "abitype";
import {
  AbiFunction,
  AbiParameter,
  AbiParameterKind,
  AbiParameterToPrimitiveType,
  CallParameters,
  ContractFunctionArgs,
  ContractFunctionName,
  ContractFunctionParameters,
  ExactPartial,
  Hex,
  IsUnion,
  MaybePartial,
  MulticallResponse,
  Narrow,
  Prettify,
  ReadContractErrorType,
  UnionEvaluate,
  UnionToTuple,
} from "viem";
import type { DefaultError, QueryKey, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Config, ReadContractsErrorType } from "@wagmi/core";
import type { ReadContractsQueryFnData, ReadContractsQueryKey } from "@wagmi/core/query";
import { PermissionV2 } from "~~/permits/types";

// MAP

const TFHE_EUINT8 = 0;
const TFHE_EUINT16 = 1;
const TFHE_EUINT32 = 2;
const TFHE_EUINT64 = 3;
const TFHE_EUINT128 = 4;
const TFHE_EUINT256 = 5;
const TFHE_EADDRESS = 12;
const TFHE_EBOOL = 13;

export const TFHE_UTYPE = {
  EUINT8: TFHE_EUINT8,
  EUINT16: TFHE_EUINT16,
  EUINT32: TFHE_EUINT32,
  EUINT64: TFHE_EUINT64,
  EUINT128: TFHE_EUINT128,
  EUINT256: TFHE_EUINT256,
  EADDRESS: TFHE_EADDRESS,
  EBOOL: TFHE_EBOOL,
  EUINT: [TFHE_EUINT8, TFHE_EUINT16, TFHE_EUINT32, TFHE_EUINT64, TFHE_EUINT128, TFHE_EUINT256],
  ALL: [TFHE_EBOOL, TFHE_EUINT8, TFHE_EUINT16, TFHE_EUINT32, TFHE_EUINT64, TFHE_EUINT128, TFHE_EUINT256, TFHE_EADDRESS],
} as const;

export type SealedOutputBool = {
  data: string;
  _utype: typeof TFHE_UTYPE.EBOOL;
};
export type SealedOutputUint = {
  data: string;
  _utype: (typeof TFHE_UTYPE.EUINT)[number];
};
export type SealedOutputAddress = {
  data: string;
  _utype: typeof TFHE_UTYPE.EADDRESS;
};

type LuxFHEMap<luxfheTransformable extends boolean = false> = {
  // Permission
  "struct PermissionV2": luxfheTransformable extends true ? "populate-luxfhe-permission" : PermissionV2;

  // Output Structs
  "struct SealedBool": luxfheTransformable extends true ? SealedOutputBool : boolean;
  "struct SealedUint": luxfheTransformable extends true ? SealedOutputUint : bigint;
  "struct SealedAddress": luxfheTransformable extends true ? SealedOutputAddress : Address;
};
export type LuxFHEMapUnion = keyof LuxFHEMap;

// BASE

export type LuxFHEAbiParameterToPrimitiveType<
  abiParameter extends AbiParameter | { name: string; type: unknown; internalType?: unknown },
  abiParameterKind extends AbiParameterKind = AbiParameterKind,
  luxfheTransformable extends boolean = false,
  // 2. Check if internalType matches user defined struct matches
> = abiParameter["internalType"] extends LuxFHEMapUnion
  ? LuxFHEMap<luxfheTransformable>[abiParameter["internalType"]]
  : AbiParameterToPrimitiveType<abiParameter, abiParameterKind>;

export type LuxFHEAbiParametersToPrimitiveTypes<
  abiParameters extends readonly AbiParameter[],
  abiParameterKind extends AbiParameterKind = AbiParameterKind,
  luxfheTransformable extends boolean = false,
> = Prettify<{
  // TODO: Convert to labeled tuple so parameter names show up in autocomplete
  // e.g. [foo: string, bar: string]
  // https://github.com/microsoft/TypeScript/issues/44939
  [key in keyof abiParameters]: LuxFHEAbiParameterToPrimitiveType<
    abiParameters[key],
    abiParameterKind,
    luxfheTransformable
  >;
}>;

// READ

export type ScopeKeyParameter = { scopeKey?: string | undefined };

export type ConfigParameter<config extends Config = Config> = {
  config?: Config | config | undefined;
};

export type UseQueryParameters<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = Compute<
  ExactPartial<Omit<UseQueryOptions<queryFnData, error, data, queryKey>, "initialData">> & {
    // Fix `initialData` type
    initialData?: UseQueryOptions<queryFnData, error, data, queryKey>["initialData"] | undefined;
  }
>;

export type QueryParameter<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = {
  query?:
    | Omit<
        UseQueryParameters<queryFnData, error, data, queryKey>,
        "queryFn" | "queryHash" | "queryKey" | "queryKeyHashFn" | "throwOnError"
      >
    | undefined;
};

export type ChainIdParameter<
  config extends Config,
  chainId extends config["chains"][number]["id"] | undefined = config["chains"][number]["id"],
> = {
  chainId?:
    | (chainId extends config["chains"][number]["id"] ? chainId : undefined)
    | config["chains"][number]["id"]
    | undefined;
};

export type PermittedParameter = { permitted: boolean };

export type Compute<type> = { [key in keyof type]: type[key] } & unknown;
export type UnionCompute<type> = type extends object ? Compute<type> : type;
export type UnionExactPartial<type> = type extends object ? ExactPartial<type> : type;

export type UseLuxFHEReadContractParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<abi, "pure" | "view"> = ContractFunctionName<abi, "pure" | "view">,
  luxfheTransformable extends boolean = false,
  args extends LuxFHEContractFunctionArgs<
    abi,
    "pure" | "view",
    functionName,
    luxfheTransformable
  > = LuxFHEContractFunctionArgs<abi, "pure" | "view", functionName, luxfheTransformable>,
  config extends Config = Config,
  selectData = LuxFHEContractFunctionReturnType<abi, "pure" | "view", functionName, luxfheTransformable, args>,
> = UnionCompute<
  LuxFHEReadContractOptions<abi, functionName, luxfheTransformable, args, config> &
    ConfigParameter<config> &
    QueryParameter<
      selectData,
      ReadContractErrorType,
      selectData,
      LuxFHEReadContractQueryKey<abi, functionName, luxfheTransformable, args, config>
    >
>;

export type LuxFHEReadContractOptions<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "pure" | "view">,
  luxfheTransformable extends boolean,
  args extends LuxFHEContractFunctionArgs<abi, "pure" | "view", functionName, luxfheTransformable>,
  config extends Config,
> = UnionExactPartial<
  LuxFHEReadContractParameters<abi, functionName, luxfheTransformable, args> & ChainIdParameter<config>
> &
  ScopeKeyParameter;

export type LuxFHEReadContractParameters<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<abi, "pure" | "view"> = ContractFunctionName<abi, "pure" | "view">,
  luxfheTransformable extends boolean = false,
  args extends LuxFHEContractFunctionArgs<
    abi,
    "pure" | "view",
    functionName,
    luxfheTransformable
  > = LuxFHEContractFunctionArgs<abi, "pure" | "view", functionName, luxfheTransformable>,
> = UnionEvaluate<
  Pick<CallParameters, "account" | "blockNumber" | "blockTag" | "factory" | "factoryData" | "stateOverride">
> &
  LuxFHEContractFunctionParameters<abi, "pure" | "view", functionName, luxfheTransformable, args, boolean>;

export function luxfheReadContractQueryKey<
  config extends Config,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "pure" | "view">,
  luxfheTransformable extends boolean,
  args extends LuxFHEContractFunctionArgs<abi, "pure" | "view", functionName, luxfheTransformable>,
>(options: LuxFHEReadContractOptions<abi, functionName, luxfheTransformable, args, config> = {} as any) {
  const { abi: _, ...rest } = options;
  return ["readContract", filterQueryOptions(rest)] as const;
}

export function filterQueryOptions<type extends Record<string, unknown>>(options: type): type {
  // destructuring is super fast
  // biome-ignore format: no formatting
  const {
    // import('@tanstack/query-core').QueryOptions
    _defaulted,
    behavior,
    gcTime,
    initialData,
    initialDataUpdatedAt,
    maxPages,
    meta,
    networkMode,
    queryFn,
    queryHash,
    queryKey,
    queryKeyHashFn,
    retry,
    retryDelay,
    structuralSharing,

    // import('@tanstack/query-core').InfiniteQueryObserverOptions
    getPreviousPageParam,
    getNextPageParam,
    initialPageParam,

    // import('@tanstack/react-query').UseQueryOptions
    _optimisticResults,
    enabled,
    notifyOnChangeProps,
    placeholderData,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnMount,
    refetchOnReconnect,
    refetchOnWindowFocus,
    retryOnMount,
    select,
    staleTime,
    suspense,
    throwOnError,

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // wagmi
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    config,
    connector,
    query,
    ...rest
  } = options;

  return rest as type;
}

export type LuxFHEReadContractQueryKey<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "pure" | "view">,
  luxfheTransformable extends boolean,
  args extends LuxFHEContractFunctionArgs<abi, "pure" | "view", functionName, luxfheTransformable>,
  config extends Config,
> = ReturnType<typeof luxfheReadContractQueryKey<config, abi, functionName, luxfheTransformable, args>>;

export type UseLuxFHEReadContractReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  functionName extends ContractFunctionName<abi, "pure" | "view"> = ContractFunctionName<abi, "pure" | "view">,
  luxfheTransformable extends boolean = false,
  args extends LuxFHEContractFunctionArgs<
    abi,
    "pure" | "view",
    functionName,
    luxfheTransformable
  > = LuxFHEContractFunctionArgs<abi, "pure" | "view", functionName, luxfheTransformable>,
  selectData = LuxFHEContractFunctionReturnType<abi, "pure" | "view", functionName, luxfheTransformable, args>,
> = UseQueryReturnType<selectData, ReadContractErrorType> & PermittedParameter;

// EXT

export type LuxFHEContractFunctionArgs<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> = ContractFunctionName<abi, mutability>,
  luxfheTransformable extends boolean = false,
> = LuxFHEAbiParametersToPrimitiveTypes<
  ExtractAbiFunction<abi extends Abi ? abi : Abi, functionName, mutability>["inputs"],
  "inputs",
  luxfheTransformable
> extends infer args
  ? [args] extends [never]
    ? readonly unknown[]
    : args
  : readonly unknown[];

export type LuxFHEContractFunctionParameters<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> = ContractFunctionName<abi, mutability>,
  luxfheTransformable extends boolean = false,
  args extends LuxFHEContractFunctionArgs<
    abi,
    mutability,
    functionName,
    luxfheTransformable
  > = LuxFHEContractFunctionArgs<abi, mutability, functionName, luxfheTransformable>,
  deployless extends boolean = false,
  ///
  allFunctionNames = ContractFunctionName<abi, mutability>,
  allArgs = ContractFunctionArgs<abi, mutability, functionName>,
  // when `args` is inferred to `readonly []` ("inputs": []) or `never` (`abi` declared as `Abi` or not inferrable), allow `args` to be optional.
  // important that both branches return same structural type
> = {
  abi: abi;
  functionName:
    | allFunctionNames // show all options
    | (functionName extends allFunctionNames ? functionName : never); // infer value
  args?: args | undefined;
  // eslint-disable-next-line @typescript-eslint/ban-types
} & (deployless extends true ? { address?: undefined; code: Hex } : { address: Address });

export type LuxFHEContractFunctionReturnType<
  abi extends Abi | readonly unknown[] = Abi,
  mutability extends AbiStateMutability = AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability> = ContractFunctionName<abi, mutability>,
  luxfheTransformable extends boolean = false,
  args extends LuxFHEContractFunctionArgs<
    abi,
    mutability,
    functionName,
    luxfheTransformable
  > = LuxFHEContractFunctionArgs<abi, mutability, functionName, luxfheTransformable>,
> = abi extends Abi
  ? Abi extends abi
    ? unknown
    : LuxFHEAbiParametersToPrimitiveTypes<
        LuxFHEExtractAbiFunctionForArgs<abi, mutability, functionName, luxfheTransformable, args>["outputs"],
        "outputs",
        luxfheTransformable
      > extends infer types
    ? types extends readonly []
      ? void
      : types extends readonly [infer type]
      ? type
      : types
    : never
  : unknown;

export type LuxFHEExtractAbiFunctionForArgs<
  abi extends Abi,
  mutability extends AbiStateMutability,
  functionName extends ContractFunctionName<abi, mutability>,
  luxfheTransformable extends boolean,
  args extends LuxFHEContractFunctionArgs<abi, mutability, functionName, luxfheTransformable>,
> = ExtractAbiFunction<abi, functionName, mutability> extends infer abiFunction extends AbiFunction
  ? IsUnion<abiFunction> extends true // narrow overloads using `args` by converting to tuple and filtering out overloads that don't match
    ? UnionToTuple<abiFunction> extends infer abiFunctions extends readonly AbiFunction[]
      ? // convert back to union (removes `never` tuple entries)
        { [k in keyof abiFunctions]: CheckArgs<abiFunctions[k], args, luxfheTransformable> }[number]
      : never
    : abiFunction
  : never;
type CheckArgs<
  abiFunction extends AbiFunction,
  args,
  luxfheTransformable extends boolean,
  ///
  targetArgs extends LuxFHEAbiParametersToPrimitiveTypes<
    abiFunction["inputs"],
    "inputs",
    luxfheTransformable
  > = LuxFHEAbiParametersToPrimitiveTypes<abiFunction["inputs"], "inputs", luxfheTransformable>,
> = (readonly [] extends args ? readonly [] : args) extends targetArgs // fallback to `readonly []` if `args` has no value (e.g. `args` property not provided)
  ? abiFunction
  : never;

export type LuxFHEMulticallContracts<
  contracts extends readonly unknown[],
  options extends {
    mutability: AbiStateMutability;
    optional?: boolean;
    properties?: Record<string, any>;
  } = { mutability: AbiStateMutability },
  luxfheTransformable extends boolean = false,
  ///
  result extends readonly any[] = [],
> = contracts extends readonly [] // no contracts, return empty
  ? readonly []
  : contracts extends readonly [infer contract] // one contract left before returning `result`
  ? readonly [
      ...result,
      MaybePartial<
        Prettify<
          GetLuxFHEMulticallContractParameters<contract, options["mutability"], luxfheTransformable> &
            options["properties"]
        >,
        options["optional"]
      >,
    ]
  : contracts extends readonly [infer contract, ...infer rest] // grab first contract and recurse through `rest`
  ? LuxFHEMulticallContracts<
      [...rest],
      options,
      luxfheTransformable,
      [
        ...result,
        MaybePartial<
          Prettify<
            GetLuxFHEMulticallContractParameters<contract, options["mutability"], luxfheTransformable> &
              options["properties"]
          >,
          options["optional"]
        >,
      ]
    >
  : readonly unknown[] extends contracts
  ? contracts
  : // If `contracts` is *some* array but we couldn't assign `unknown[]` to it, then it must hold some known/homogenous type!
  // use this to infer the param types in the case of Array.map() argument
  contracts extends readonly (infer contract extends ContractFunctionParameters)[]
  ? readonly MaybePartial<Prettify<contract & options["properties"]>, options["optional"]>[]
  : // Fallback
    readonly MaybePartial<Prettify<ContractFunctionParameters & options["properties"]>, options["optional"]>[];

export type LuxFHEMulticallResults<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  luxfheTransformable extends boolean = false,
  options extends {
    error?: Error;
    mutability: AbiStateMutability;
  } = { error: Error; mutability: AbiStateMutability },
  ///
  result extends any[] = [],
> = contracts extends readonly [] // no contracts, return empty
  ? readonly []
  : contracts extends readonly [infer contract] // one contract left before returning `result`
  ? [
      ...result,
      MulticallResponse<
        GetLuxFHEMulticallContractReturnType<contract, options["mutability"], luxfheTransformable>,
        options["error"],
        allowFailure
      >,
    ]
  : contracts extends readonly [infer contract, ...infer rest] // grab first contract and recurse through `rest`
  ? LuxFHEMulticallResults<
      [...rest],
      allowFailure,
      luxfheTransformable,
      options,
      [
        ...result,
        MulticallResponse<
          GetLuxFHEMulticallContractReturnType<contract, options["mutability"], luxfheTransformable>,
          options["error"],
          allowFailure
        >,
      ]
    >
  : readonly unknown[] extends contracts
  ? MulticallResponse<unknown, options["error"], allowFailure>[]
  : // If `contracts` is *some* array but we couldn't assign `unknown[]` to it, then it must hold some known/homogenous type!
  // use this to infer the param types in the case of Array.map() argument
  contracts extends readonly (infer contract extends ContractFunctionParameters)[]
  ? MulticallResponse<
      GetLuxFHEMulticallContractReturnType<contract, options["mutability"], luxfheTransformable>,
      options["error"],
      allowFailure
    >[]
  : // Fallback
    MulticallResponse<unknown, options["error"], allowFailure>[];

// infer contract parameters from `unknown`
export type GetLuxFHEMulticallContractParameters<
  contract,
  mutability extends AbiStateMutability,
  luxfheTransformable extends boolean = false,
> = contract extends {
  abi: infer abi extends Abi;
} // 1. Check if `abi` is const-asserted or defined inline
  ? // 1a. Check if `functionName` is valid for `abi`
    contract extends {
      functionName: infer functionName extends ContractFunctionName<abi, mutability>;
    }
    ? // 1aa. Check if `args` is valid for `abi` and `functionName`
      contract extends {
        args: infer args extends LuxFHEContractFunctionArgs<abi, mutability, functionName, luxfheTransformable>;
      }
      ? LuxFHEContractFunctionParameters<abi, mutability, functionName, luxfheTransformable, args> // `args` valid, pass through
      : LuxFHEContractFunctionParameters<abi, mutability, functionName, luxfheTransformable> // invalid `args`
    : // 1b. `functionName` is invalid, check if `abi` is declared as `Abi`
    Abi extends abi
    ? LuxFHEContractFunctionParameters // `abi` declared as `Abi`, unable to infer types further
    : // `abi` is const-asserted or defined inline, infer types for `functionName` and `args`
      LuxFHEContractFunctionParameters<abi, mutability>
  : LuxFHEContractFunctionParameters<readonly unknown[]>; // invalid `contract['abi']`, set to `readonly unknown[]`

type GetLuxFHEMulticallContractReturnType<
  contract,
  mutability extends AbiStateMutability,
  luxfheTransformable extends boolean = false,
> = contract extends {
  abi: infer abi extends Abi;
} // 1. Check if `abi` is const-asserted or defined inline
  ? // Check if `functionName` is valid for `abi`
    contract extends {
      functionName: infer functionName extends ContractFunctionName<abi, mutability>;
    }
    ? // Check if `args` is valid for `abi` and `functionName`
      contract extends {
        args: infer args extends LuxFHEContractFunctionArgs<abi, mutability, functionName, luxfheTransformable>;
      }
      ? LuxFHEContractFunctionReturnType<abi, mutability, functionName, luxfheTransformable, args> // `args` valid, pass through
      : LuxFHEContractFunctionReturnType<abi, mutability, functionName> // invalid `args`
    : LuxFHEContractFunctionReturnType<abi, mutability> // Invalid `functionName`
  : LuxFHEContractFunctionReturnType; // invalid `contract['abi']` (not const-asserted or declared as `Abi`)

export type UseLuxFHEReadContractsParameters<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  luxfheTransformable extends boolean = false,
  config extends Config = Config,
  selectData = LuxFHEMulticallResults<contracts, allowFailure, false>,
> = Compute<
  LuxFHEReadContractsOptions<contracts, allowFailure, config, luxfheTransformable> &
    ConfigParameter<config> &
    QueryParameter<
      ReadContractsQueryFnData<contracts, allowFailure>,
      ReadContractsErrorType,
      selectData,
      ReadContractsQueryKey<contracts, allowFailure, config>
    >
>;

export type LuxFHEReadContractsOptions<
  contracts extends readonly unknown[],
  allowFailure extends boolean,
  config extends Config,
  luxfheTransformable extends boolean = false,
> = ExactPartial<
  LuxFHEMulticallParameters<
    contracts,
    allowFailure,
    { optional: true; properties: ChainIdParameter<config> },
    luxfheTransformable
  >
> &
  ScopeKeyParameter;

export type LuxFHEMulticallParameters<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  options extends {
    optional?: boolean;
    properties?: Record<string, any>;
  } = {},
  luxfheTransformable extends boolean = false,
> = Pick<CallParameters, "blockNumber" | "blockTag" | "stateOverride"> & {
  allowFailure?: allowFailure | boolean | undefined;
  batchSize?: number | undefined;
  contracts: LuxFHEMulticallContracts<
    Narrow<contracts>,
    { mutability: AbiStateMutability } & options,
    luxfheTransformable
  >;
  multicallAddress?: Address | undefined;
};

export type UseQueryReturnType<data = unknown, error = DefaultError> = Compute<
  UseQueryResult<data, error> & {
    queryKey: QueryKey;
  }
>;

export type UseLuxFHEReadContractsReturnType<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  selectData = LuxFHEMulticallReturnType<contracts, allowFailure>,
> = UseQueryReturnType<selectData, ReadContractsErrorType>;

export type LuxFHEMulticallReturnType<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  options extends {
    error?: Error;
  } = { error: Error },
> = LuxFHEMulticallResults<Narrow<contracts>, allowFailure, false, { mutability: AbiStateMutability } & options>;
