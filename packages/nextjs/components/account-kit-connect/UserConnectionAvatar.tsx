import { useAccount, useUser } from "@account-kit/react";

import { UserAvatar } from "../UserAvatar";
import truncateAddress from "~~/utils/truncate-address";
import { DeploymentStatusIndicator } from "../DeploymentStatusIndicator";

interface UserConnectionAvatarProps {
  isFocused?: boolean;
  showDeploymentStatus?: boolean;
  deploymentStatus: boolean;
}
const UserConnectionAvatar = ({ showDeploymentStatus = true, deploymentStatus }: UserConnectionAvatarProps) => {
  const user = useUser();
  const { address: SCAUserAddress } = useAccount({
    type: "LightAccount",
  });

  const isEOAUser = user?.type === "eoa";

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-row items-center min-w-0 gap-4">
      <div className="flex flex-col min-w-0">
        <span className="text-fg-secondary text-left text-xs font-semibold">Hello,</span>
        <div className="flex flex-row items-center min-w-0 gap-1">
          <h3 className="font-semibold text-left text-ellipsis w-full mb-0">
            {isEOAUser ? (
              truncateAddress(user.address)
            ) : (
              <span className="w-full overflow-hidden text-ellipsis">{user.email}</span>
            )}
          </h3>
        </div>
      </div>
      <div className="relative w-8 h-8">
        <UserAvatar address={SCAUserAddress ?? user.address} />
        {showDeploymentStatus && (
          <div className={`w-4 h-4 rounded-full absolute -top-1 -right-1 bg-base-200 flex items-center justify-center`}>
            <DeploymentStatusIndicator isDeployed={!!deploymentStatus} />
          </div>
        )}
      </div>
    </div>
  );
};

export { UserConnectionAvatar };
