"use client";

import { useSendUserOperation, useSmartAccountClient } from "@account-kit/react";
import { Fragment, useState } from "react";
import { encodeFunctionData } from "viem";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { DerivedTokenData, useTokensStore } from "~~/services/store/tokensStore";
import { notification } from "~~/utils/scaffold-eth";
import { bigintFromStringWithDec } from "~~/utils/scaffold-eth/bigint";

export const MockTokenMintModal: React.FC<{ token: DerivedTokenData }> = ({ token }) => {
  const [open, setOpen] = useState(false);
  const [enc, setEnc] = useState(true);
  const [mintAmount, setMintAmount] = useState("1");

  const { client } = useSmartAccountClient({ type: "LightAccount" });
  const { data: fherc20 } = useDeployedContractInfo("FHERC20");
  const fherc20Abi = fherc20?.abi;

  const amountAndTokenString = `${mintAmount} ${enc ? "e" : ""}${token.symbol}`;

  const { sendUserOperation, isSendingUserOperation } = useSendUserOperation({
    client,
    waitForTxn: true,
    onSuccess: ({ hash, request }) => {
      console.log("Mint success", hash, request);
      notification.success(`Minted ${amountAndTokenString}`);
      useTokensStore.getState().refetchTokens();
    },
    onError: error => {
      console.error(`Error ${amountAndTokenString}`, error);
      notification.error(`Error Minting ${amountAndTokenString}`);
    },
  });

  const mintToken = () => {
    if (client == null) return;
    if (fherc20Abi == null) return;
    sendUserOperation({
      uo: {
        target: token.address,
        data: encodeFunctionData({
          abi: fherc20Abi,
          functionName: enc ? "encMint" : "mint",
          args: [client.getAddress(), bigintFromStringWithDec(mintAmount, token.decimals)],
        }),
      },
    });
  };

  return (
    <>
      <button className="btn btn-sm" onClick={() => setOpen(true)}>
        Mint
      </button>
      <dialog className="modal" open={open}>
        <div className="modal-box flex flex-col gap-8">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setOpen(false)}>
            ✕
          </button>
          <h3 className="font-bold text-lg mb-4">Mint Mock FHERC20 - {token.symbol}</h3>

          <div className="flex flex-row items-center justify-start gap-4">
            <div className="text-sm font-bold">Mint:</div>
            <div className="flex flex-row items-center justify-start gap-2">
              <button className={`btn btn-sm ${enc ? "btn-primary" : "btn-ghost"}`} onClick={() => setEnc(true)}>
                Encrypted e{token.symbol}
              </button>
              /
              <button className={`btn btn-sm ${!enc ? "btn-primary" : "btn-ghost"}`} onClick={() => setEnc(false)}>
                Public {token.symbol}
              </button>
            </div>
          </div>

          <div className="flex flex-row items-center justify-start gap-4">
            <div className="text-sm font-bold">Amount:</div>
            <div className="flex flex-row items-center justify-start gap-2">
              {["0.1", "0.5", "1", "5", "10"].map((amount, index) => {
                return (
                  <Fragment key={amount}>
                    <button
                      className={`btn btn-sm ${mintAmount === amount ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => setMintAmount(amount)}
                    >
                      {amount}
                    </button>
                    {index < 4 && "/"}
                  </Fragment>
                );
              })}
            </div>
          </div>

          <button className="btn btn-primary w-full" onClick={mintToken} disabled={isSendingUserOperation}>
            {isSendingUserOperation ? "Minting" : "Mint"} {amountAndTokenString}
            {isSendingUserOperation && <span className="loading loading-spinner loading-xs"></span>}
          </button>
        </div>
        <div className="modal-backdrop bg-slate-600 bg-opacity-40" onClick={() => setOpen(false)} />
      </dialog>
    </>
  );
};
