import { HTMLAttributes } from "react";

type DeploymentStatusIndicatorProps = {
  isDeployed: boolean;
  showCheckIcon?: boolean;
};

const DeploymentStatusIndicator = ({
  isDeployed,
  className,
  ...props
}: DeploymentStatusIndicatorProps & HTMLAttributes<HTMLDivElement>) => {
  const indicatorBackgroundColor = isDeployed ? "bg-bg-surface-success" : "bg-bg-surface-warning";

  return <div className={`w-[12px] h-[12px] rounded-full ${indicatorBackgroundColor} ${className}`} {...props} />;
};

export { DeploymentStatusIndicator };
