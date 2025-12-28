export type Unsealable<T> = { data: T; unsealed: true } | { data: undefined; unsealed: false };

export type Unsealed<R> = R extends Unsealable<infer T> ? NonNullable<T> : NonNullable<R>;

export type UnsealedArray<T extends Array<Unsealable<any> | any>> = { [K in keyof T]: Unsealed<T[K]> };

export const NullUnsealed = { unsealed: false, data: undefined } as const;

export function processUnsealables<T extends any[], C>(
  items: [...T],
  callback: (...args: UnsealedArray<[...T]>) => C,
): { unsealed: true; data: C } | { unsealed: false; data: undefined } {
  const defArr = [];

  for (const item of items) {
    if (item == null) return NullUnsealed;

    if (isUnsealable(item)) {
      if (!(item as Unsealable<any>).unsealed) return NullUnsealed;
      defArr.push((item as Unsealable<any>).data);
      continue;
    }

    defArr.push(item);
  }

  return unsealed(callback(...(defArr as UnsealedArray<[...T]>)));
}

export function unsealed<T>(data: T): { unsealed: true; data: T } {
  return { unsealed: true, data };
}

// Type guard to check if an item is Unsealable
export function isUnsealable<T>(item: any): item is Unsealable<T> {
  return typeof item === "object" && "unsealed" in item;
}

export function unsealableVal<T>(unsealable: Unsealable<T> | undefined, fallback: T): T {
  if (unsealable == null || !unsealable.unsealed) return fallback;
  return unsealable.data;
}
