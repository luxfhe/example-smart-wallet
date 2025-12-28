import { useAuthModal, useUser } from "@account-kit/react";

const UserConnectButton = () => {
  const user = useUser();
  const { openAuthModal } = useAuthModal();

  if (user) return null;

  return (
    <div className="btn" onClick={() => openAuthModal()}>
      CONNECT
    </div>
  );
};

export { UserConnectButton };
