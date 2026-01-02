"use client";

import { useAccount } from "@account-kit/react";
import React from "react";
import { usePermitModalOpen } from "~~/services/store/permitModalStore";
import { processUnsealables, Unsealable, Unsealed, UnsealedArray } from "~~/utils/fhenix/unsealable";

type UnsealableDisplayBaseProps = {
  nullish?: boolean;
  className?: string;
  sealedClassName?: string;
  sealedLength?: number;
};

/// Displays unsealable values, they will be sealed if the connected user does not have a PermitV2 to supply to the contracts
/// This component acts as a button, and clicking it will open the PermitV2 modal for the user to interact with.
export const UnsealableDisplay = <T,>({
  item,
  fn = val => `${val}`,
  nullish = false,
  className = "",
  sealedClassName = "relative",
  sealedLength = 5,
}: {
  item: Unsealable<T> | T | undefined;
  fn?: (item: NonNullable<T> | Unsealed<T>) => string;
} & UnsealableDisplayBaseProps) => {
  const { address } = useAccount({ type: "LightAccount" });
  const isNullish = nullish || item == null;
  const unsealable = processUnsealables([item], fn);
  const isUnsealed = unsealable == null || unsealable.unsealed;
  const isUnsealable = address != null && unsealable != null && !unsealable.unsealed;
  const { setOpen } = usePermitModalOpen();

  return (
    <span
      className={[
        className,
        isUnsealable ? "hover:underline cursor-pointer" : "",
        isUnsealed ? "" : sealedClassName,
      ].join(" ")}
      onClick={() => {
        if (!isUnsealable) return;
        setOpen(true);
      }}
    >
      {address == null || isNullish
        ? "-".repeat(sealedLength)
        : !unsealable.unsealed
        ? "*".repeat(sealedLength)
        : unsealable.data}
    </span>
  );
};

export const UnsealablesDisplay = <T extends any[]>({
  items,
  fn,
  ...props
}: {
  items: [...T];
  fn: (...args: UnsealedArray<[...T]>) => string;
} & UnsealableDisplayBaseProps) => {
  const anyNullish = props.nullish || items.some(item => item == null);
  const unsealable = processUnsealables(items, fn);
  return <UnsealableDisplay item={anyNullish ? undefined : unsealable} {...props} />;
};
