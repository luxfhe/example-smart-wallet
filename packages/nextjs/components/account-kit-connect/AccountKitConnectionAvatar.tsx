import { UserConnectionAvatar } from "./UserConnectionAvatar";
import { UserConnectionDetails } from "./UserConnectionDetails";
import React, { useRef } from "react";
import { useAccount, useUser } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { UserConnectButton } from "./UserConnectButton";

type RenderAvatarMenuProps = {
  deploymentStatus: boolean;
};
export const AccountKitUserConnectionAvatar = () => {
  const { account } = useAccount({
    type: "LightAccount",
  });

  const { data: deploymentStatus = false } = useQuery({
    queryKey: ["deploymentStatus"],
    queryFn: async () => {
      const initCode = await account?.getInitCode();
      return initCode && initCode === "0x";
    },
    enabled: !!account,
  });

  return <AccountKitDropdown deploymentStatus={deploymentStatus} />;
};

const AccountKitDropdown = ({ deploymentStatus }: RenderAvatarMenuProps) => {
  const user = useUser();
  const dropdownRef = useRef<HTMLDetailsElement>(null);
  const closeDropdown = () => {
    dropdownRef.current?.removeAttribute("open");
  };
  useOutsideClick(dropdownRef, closeDropdown);

  if (user == null) {
    return <UserConnectButton />;
  }

  return (
    <details ref={dropdownRef} className="dropdown dropdown-end">
      <summary tabIndex={0} className="btn">
        <UserConnectionAvatar deploymentStatus={deploymentStatus} />
      </summary>
      <ul
        tabIndex={0}
        className="dropdown-content menu z-[2] p-2 mt-2 shadow-center shadow-accent bg-base-200 w-72 gap-1"
      >
        <UserConnectionDetails deploymentStatus={deploymentStatus} onClose={closeDropdown} />
      </ul>
    </details>
  );
};
