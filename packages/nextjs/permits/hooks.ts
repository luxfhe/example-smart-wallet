import { useStore } from "zustand";
import { permitsStore } from "./store";
import { PermitV2 } from "./permitV2";
import { useAccount } from "@account-kit/react";

export const useFhenixPermit = () => {
  const { address } = useAccount({ type: "LightAccount" });

  return useStore(permitsStore, state => {
    if (address == null) return undefined;

    const activePermitHash = state.activePermitHash[address];
    if (activePermitHash == null) return undefined;

    const permit = state.permits[address]?.[activePermitHash];
    if (permit == null) return undefined;

    return PermitV2.deserialize(permit);
  });
};

export const useFhenixPermitWithHash = (hash: string | undefined) => {
  const { address } = useAccount({ type: "LightAccount" });

  return useStore(permitsStore, state => {
    if (address == null) return undefined;
    if (hash == null) return undefined;

    const permit = state.permits[address]?.[hash];
    if (permit == null) return undefined;

    return PermitV2.deserialize(permit);
  });
};

export const useFhenixActivePermitHash = () => {
  const { address } = useAccount({ type: "LightAccount" });

  return useStore(permitsStore, state => {
    if (address == null) return undefined;

    return state.activePermitHash[address];
  });
};

export const useFhenixAllPermits = () => {
  const { address } = useAccount({ type: "LightAccount" });

  return useStore(permitsStore, state => {
    if (address == null) return {};

    return Object.entries(state.permits[address] ?? {}).reduce((acc, [hash, permit]) => {
      if (permit == undefined) return acc;
      return { ...acc, [hash]: PermitV2.deserialize(permit) };
    }, {} as Record<string, PermitV2>);
  });
};
