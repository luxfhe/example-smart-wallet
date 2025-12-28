import { useAccount, useLogout, useSigner, useUser } from "@account-kit/react";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { DeploymentStatusIndicator } from "../DeploymentStatusIndicator";
import { UserAddressRow } from "./UserAddressRow";

type UserConnectionDetailsProps = {
  deploymentStatus: boolean;
  onClose: () => void;
};
export function UserConnectionDetails({ deploymentStatus, onClose }: UserConnectionDetailsProps) {
  const user = useUser();
  const signer = useSigner();
  const { logout } = useLogout();
  const scaAccount = useAccount({ type: "LightAccount" });

  const isEOAUser = user?.type === "eoa";

  const getSignerAddress = async (): Promise<string | null> => {
    const signerAddress = await signer?.getAddress();
    return signerAddress ?? null;
  };

  const { data: signerAddress = "" } = useQuery({
    queryKey: ["signerAddress"],
    queryFn: getSignerAddress,
  });

  if (!user) return null;

  if (isEOAUser) {
    return (
      <>
        {/* EOA Address */}
        <li>
          <UserAddressRow label="EOA Address" address={user?.address} />
        </li>

        {/* Logout */}
        <li
          onClick={() => {
            logout();
            onClose();
          }}
        >
          <span className="font-semibold text-md md:text-xs text-btn-primary">
            Logout
            <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
          </span>
        </li>
      </>
    );
  }

  return (
    <>
      {/* Smart Account */}
      <li>
        <UserAddressRow label="Smart account" address={scaAccount?.address ?? ""} />
      </li>

      {/* Status */}
      <div className="flex flex-row justify-between items-center px-4 py-2">
        <span className="text-md md:text-sm text-fg-secondary">Status</span>
        <div className="flex flex-row items-center">
          <DeploymentStatusIndicator isDeployed={!!deploymentStatus} className="w-[12px] h-[12px]" />
          <span className="text-fg-primary block ml-1 text-md md:text-sm">
            {deploymentStatus ? "Deployed" : "Not deployed"}
          </span>
        </div>
      </div>

      <div className="mt-4" />

      {/* Signer */}
      <li>
        {/* <a
          target="_blank"
          href="https://accountkit.alchemy.com/concepts/smart-account-signer"
          className="flex justify-center items-center"
        >
          <span className="text-md md:text-sm text-fg-secondary mr-1">Signer</span>
          <div className="flex flex-row justify-center items-center w-[14px] h-[14px] ml-1">
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </div>
        </a> */}

        <UserAddressRow label="Signer" address={signerAddress} />
      </li>

      {/* Logout */}
      <li
        onClick={() => {
          logout();
          onClose();
        }}
      >
        <span className="font-semibold text-md md:text-xs text-btn-primary">
          Logout
          <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
        </span>
      </li>
    </>
  );
}
