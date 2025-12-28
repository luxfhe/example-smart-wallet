"use client";

import { useLuxFHEPermit } from "~~/permits/hooks";
import { getTimestamp } from "./utils";

const useLuxFHEPermitStatus = () => {
  const permit = useLuxFHEPermit();
  const currentTimestamp = getTimestamp();
  const isExpired = permit == null ? false : permit.expiration <= currentTimestamp;

  if (permit == null) return "missing";
  if (isExpired) return "expired";
  return "active";
};

export const PermitV2StatusIndicator = () => {
  const status = useLuxFHEPermitStatus();
  const bgColor =
    status === "active"
      ? "bg-bg-surface-success"
      : status === "expired"
      ? "bg-bg-surface-warning"
      : "bg-bg-surface-error";

  return <div className={`w-[12px] h-[12px] rounded-full ${bgColor}`} />;
};

const PermitV2StatusText = () => {
  const status = useLuxFHEPermitStatus();

  return (
    <div className="text-sm">
      {status === "missing" && "No Active Permit"}
      {status === "expired" && "Permit Expired"}
      {status === "active" && "Active"}
    </div>
  );
};

export const PermitV2ActivePermitStatus = () => {
  return (
    <div className="flex flex-row items-center justify-between">
      <div className="text-sm font-bold">Current Permit Status:</div>
      <div className="flex flex-row items-center justify-center gap-2">
        <PermitV2StatusIndicator />
        <PermitV2StatusText />
      </div>
    </div>
  );
};
