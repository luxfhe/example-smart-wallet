"use client";

import { AccountKitUserConnectionAvatar } from "~~/components/account-kit-connect/AccountKitConnectionAvatar";
import { PermitModalButton } from "./PermitButton";

export const HeaderButtonsSection = () => {
  return (
    <div className="flex flex-row gap-4">
      <PermitModalButton />
      <AccountKitUserConnectionAvatar />
    </div>
  );
};
