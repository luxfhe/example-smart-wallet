import { useConnection } from "@account-kit/react";
import { useMemo } from "react";
import truncateAddress from "~~/utils/truncate-address";

export const UserAddressRow = ({ label, address }: { label: string | null; address: string | null }) => {
  const connection = useConnection();
  const truncatedAddress = truncateAddress(address ?? "");
  const addressBlockExplorerUrl = useMemo(() => {
    if (!address || !connection.chain.blockExplorers) {
      return null;
    }

    return `${connection.chain.blockExplorers?.default.url}/address/${address}`;
  }, [address, connection]);

  return (
    <a target="_blank" className="flex flex-row justify-between items-center" href={addressBlockExplorerUrl ?? "#"}>
      <span className="text-md md:text-sm text-fg-secondary">{label}</span>
      <span className="text-fg-primary underline text-md md:text-sm">{truncatedAddress}</span>
    </a>
  );
};
