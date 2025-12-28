export const bigintFixed = (
  num: bigint | undefined = 0n,
  decimals: number | undefined = 18,
  precision?: number,
): string => {
  let str = num.toString();
  if (str.length < decimals) str = `${"0".repeat(decimals + 1 - str.length)}${str}`;
  const preDecimalSection = str.slice(0, str.length - decimals);
  const postDecimalSection = str.slice(str.length - decimals, str.length - decimals + (precision ?? decimals));
  return `${preDecimalSection === "" ? "0" : preDecimalSection}${
    postDecimalSection.length > 0 ? "." : ""
  }${postDecimalSection}`;
};

export const bigintMinLength = (num: bigint, length: number) => {
  const str = num.toString();
  if (str.length > length) return str;
  return `${"0".repeat(length - str.length)}${str}`;
};

export const bigintMin = (a: bigint, b: bigint) => {
  return a < b ? a : b;
};
export const bigintMax = (...vals: bigint[]) => {
  return vals.reduce((acc, c) => (c > acc ? c : acc), vals[0]);
};

export const bigintString = (
  num: bigint | undefined = 0n,
  decimals: number | undefined = 18,
  precision?: number,
): string => {
  let str = num.toString();

  // Pad with leading zeroes
  if (str.length < decimals) str = `${"0".repeat(decimals + 1 - str.length)}${str}`;

  // Insert decimal point
  str = `${str.slice(0, str.length - decimals)}.${str.slice(
    str.length - decimals,
    str.length - decimals + (precision ?? decimals),
  )}`;

  // Remove trailing zeros
  str = str.replace(/0+$/, "");

  // Remove trailing decimal point if it exists
  if (str.endsWith(".")) {
    str = str.slice(0, -1);
  }

  return str;
};

export const stringGetDecimals = (str: string) => {
  return (str.split(".")[1] ?? "").length;
};

export const bigintFromStringWithDec = (str: string, decimals: number | undefined = 18): bigint => {
  const parts = str.split(".");
  if (parts.length === 0) return BigInt(`${parts[0]}${"0".repeat(decimals)}`);
  return BigInt(`${parts[0]}${(parts[1] ?? "").concat("0".repeat(decimals)).slice(0, decimals)}`);
};

export const bigintE = (num: number | undefined, decimals: number | undefined) => {
  return BigInt((num ?? 1) * 10 ** (decimals ?? 18));
};

export const bigintToFloat = (num?: bigint, decimals?: number) => parseFloat(bigintFixed(num, decimals));
export const bigintToInt = (num: bigint) => parseInt(num.toString());
export const bigintAbs = (num: bigint) => (num >= 0 ? num : -num);

export const oneE18 = BigInt(1 * 10 ** 18);

export const Stringify = (val: any) => {
  return JSON.stringify(val, (_, v) => (typeof v === "bigint" ? `${v.toString()}n` : v), 2);
};
