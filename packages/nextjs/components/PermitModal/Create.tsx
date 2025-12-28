"use client";

import { useChain, useAccount } from "@account-kit/react";
import { ArrowDownTrayIcon, ArrowUpTrayIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import React from "react";
import { useState } from "react";
import { zeroAddress, isAddress, getAddress } from "viem";
import { AddressInput, InputBase } from "~~/components/scaffold-eth";
import { PermitV2 } from "~~/permits/permitV2";
import { setPermit, setActivePermitHash } from "~~/permits/store";
import { AbstractSigner } from "~~/permits/types";
import {
  usePermitCreateOptions,
  usePermitModalOpen,
  PermitV2CreateType,
  usePermitCreateOptionsAndActions,
  usePermitModalFocusedPermitHash,
} from "~~/services/store/permitModalStore";
import { notification } from "~~/utils/scaffold-eth";
import truncateAddress from "~~/utils/truncate-address";
import { getTimestamp } from "./utils";

const expirationOptions = [
  {
    label: "24h",
    offset: 24 * 60 * 60,
  },
  {
    label: "48h",
    offset: 48 * 60 * 60,
  },
  {
    label: "1w",
    offset: 7 * 24 * 60 * 60,
  },
  {
    label: "1m",
    offset: 30 * 24 * 60 * 60,
  },
  {
    label: "Inf",
    offset: 365 * 24 * 60 * 60,
  },
];

const PermitV2ModalCreateButton: React.FC<{ disabled?: boolean }> = ({ disabled = false }) => {
  const { chain } = useChain();
  const { account } = useAccount({ type: "LightAccount" });
  const createOptions = usePermitCreateOptions();
  const { setOpen } = usePermitModalOpen();
  const [creating, setCreating] = useState(false);
  const { setFocusedPermitHash } = usePermitModalFocusedPermitHash();

  let cta = createOptions.type === PermitV2CreateType.Using ? "Create" : "Sign and Open";
  if (creating) {
    cta = createOptions.type === PermitV2CreateType.Using ? "Creating" : "Signing";
  }

  const createPermitV2 = async () => {
    if (account == null || chain == null) return;

    setCreating(true);

    const abstractSigner: AbstractSigner = {
      getAddress: async () => account.address,
      // Should probably add the primaryType to this in the abstract signer to make it easier to interact with via viem
      signTypedData: (domain, types, primaryType, value: Record<string, unknown>) =>
        account.signTypedData({ domain, types, primaryType, message: value }),
    };

    const permit = await PermitV2.createAndSign(
      {
        name: createOptions.name.length > 0 ? createOptions.name : "Unnamed Permit",
        type: createOptions.type === PermitV2CreateType.Using ? "self" : "sharing",
        issuer: account.address,
        recipient: createOptions.recipient.length > 0 ? createOptions.recipient : zeroAddress,
        expiration: getTimestamp() + createOptions.expirationOffset,
        projects: createOptions.projects,
        contracts: createOptions.contracts,
      },
      chain.id.toString(),
      abstractSigner,
    );

    setPermit(account.address, permit);
    setCreating(false);
    notification.success("Permit Created Successfully");

    if (createOptions.type === PermitV2CreateType.Using) {
      setActivePermitHash(account.address, permit.getHash());
      setTimeout(() => setOpen(false));
    } else {
      setFocusedPermitHash(permit.getHash());
    }
  };

  return (
    <button className={`btn btn-primary flex-[3] ${disabled && "btn-disabled"}`} onClick={createPermitV2}>
      {cta}
      {creating && <span className="loading loading-spinner loading-sm"></span>}
    </button>
  );
};

export const PermitV2ModalCreate = () => {
  const {
    name,
    type,
    recipient,
    expirationOffset,
    contracts,
    projects,
    accessSatisfiesRequirements,
    setName,
    setType,
    setRecipient,
    setExpirationOffset,
    addContract,
    removeContract,
    addProject,
    removeProject,
    reset,
  } = usePermitCreateOptionsAndActions();

  const recipientAddressInvalid =
    type === PermitV2CreateType.Sharing && (recipient.length === 0 || !isAddress(recipient));

  const [addingContractAddress, setAddingContractAddress] = useState<string>("");
  const addingContractAddressInvalid =
    addingContractAddress.length > 0 &&
    (!isAddress(addingContractAddress) || contracts.includes(getAddress(addingContractAddress)));

  const [addingProject, setAddingProject] = useState<string>("");
  const addingProjectInvalid = addingProject.length > 0 && projects.includes(addingProject);

  const accessInvalid = projects.length === 0 && contracts.length === 0;

  const formInvalid =
    !accessSatisfiesRequirements ||
    accessInvalid ||
    recipientAddressInvalid ||
    addingContractAddressInvalid ||
    addingProjectInvalid;

  return (
    <>
      {/* Name */}
      <div className="flex flex-row items-center justify-start gap-4">
        <div className="text-sm font-bold">Name:</div>
        <InputBase
          name="permit-name"
          value={name}
          placeholder="Unnamed Permit"
          onChange={(value: string) => setName(value)}
        />
      </div>

      {/* Type */}
      <div className="flex flex-row items-center justify-start gap-4">
        <div className="text-sm font-bold">Purpose:</div>
        <button
          className={`btn btn-sm ${type === PermitV2CreateType.Using ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setType(PermitV2CreateType.Using)}
        >
          For Using <ArrowDownTrayIcon className="w-4 h-4" />
        </button>
        /
        <button
          className={`btn btn-sm ${type === PermitV2CreateType.Sharing ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setType(PermitV2CreateType.Sharing)}
        >
          For Sharing <ArrowUpTrayIcon className="w-4 h-4 rotate-90" />
        </button>
      </div>

      {/* (Sharing) Recipient */}
      {type === PermitV2CreateType.Sharing && (
        <div className="flex flex-row items-center justify-start gap-4">
          <div className={`text-sm font-bold ${recipientAddressInvalid && "text-error"}`}>Recipient:</div>
          <AddressInput
            name="add-recipient"
            value={recipient}
            placeholder="recipient address"
            onChange={(value: any) => setRecipient(value)}
            useENS={false}
            useBlo={false}
          />
        </div>
      )}

      {/* Expiration */}
      <div className="flex flex-row items-center justify-start gap-4">
        <div className="text-sm font-bold">Expires in:</div>
        <div className="flex flex-row gap-2 items-center">
          {expirationOptions.map((option, index) => (
            <React.Fragment key={index}>
              <button
                className={`btn btn-sm ${option.offset === expirationOffset ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setExpirationOffset(option.offset)}
              >
                {option.label}
              </button>
              {index < expirationOptions.length - 1 && "/"}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Access */}
      <div className={`text-sm font-bold ${accessInvalid && "text-error"}`}>
        Access
        <span className="italic font-normal">
          {" "}
          - grant access to individual contracts or full projects, defaults to this dApp{"'"}s requirements. Projects
          and Contracts cannot both be empty.
        </span>
      </div>

      {/* Contracts */}
      <div className="flex flex-col w-full gap-2">
        <div className="flex flex-row items-center justify-start">
          <div
            className={`text-sm font-bold ml-4 mr-4 ${
              addingContractAddress.length > 0 && addingContractAddressInvalid && "text-error"
            }`}
          >
            Contracts:
          </div>
          <AddressInput
            name="add-contract"
            value={addingContractAddress}
            placeholder="add contract"
            onChange={(value: any) => setAddingContractAddress(value)}
            useENS={false}
            useBlo={false}
          />
          <button
            className={`btn btn-sm btn-secondary ${
              (addingContractAddressInvalid || addingContractAddress.length === 0) && "btn-disabled"
            }`}
            onClick={() => {
              if (addingContractAddressInvalid) return;
              addContract(addingContractAddress);
              setAddingContractAddress("");
            }}
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        {contracts.length > 0 && (
          <div className="flex flex-row gap-2 flex-wrap ml-8">
            {contracts.map(contract => (
              <button key={contract} className="btn btn-sm btn-accent" onClick={() => removeContract(contract)}>
                {truncateAddress(contract)} <XMarkIcon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="flex flex-col w-full gap-2">
        <div className="flex flex-row items-center justify-start">
          <div
            className={`text-sm font-bold ml-4 mr-4 ${
              addingProject.length > 0 && addingProjectInvalid && "text-error"
            }`}
          >
            Projects:
          </div>
          <InputBase
            name="project-idt"
            value={addingProject}
            placeholder="project id"
            onChange={(value: string) => setAddingProject(value.toUpperCase())}
          />
          <div
            className={`btn btn-secondary btn-sm ${
              (addingProjectInvalid || addingProject.length === 0) && "btn-disabled"
            }`}
            onClick={() => {
              if (addingProjectInvalid) return;
              addProject(addingProject);
              setAddingProject("");
            }}
          >
            <PlusIcon className="w-4 h-4" />
          </div>
        </div>
        {projects.length > 0 && (
          <div className="flex flex-row gap-2 flex-wrap ml-8">
            {projects.map(project => (
              <button key={project} className="btn btn-sm btn-accent" onClick={() => removeProject(project)}>
                {project} <XMarkIcon className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Access requirements not satisfied */}
      {!accessSatisfiesRequirements && (
        <div className="italic text-sm text-error">! dApp{"'"}s access requirements not met !</div>
      )}

      {/* Create Button */}
      <div className="divider -my-1" />
      <div className="flex flex-row gap-4">
        <button className="btn btn-error flex-[1]" onClick={reset}>
          Reset
        </button>
        <PermitV2ModalCreateButton disabled={formInvalid} />
      </div>
    </>
  );
};
