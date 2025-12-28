"use client";

import { usePermitModalTab, PermitV2Tab } from "~~/services/store/permitModalStore";

export const PermitV2TabInstructions = () => {
  const { tab } = usePermitModalTab();

  return (
    <div className="text-sm">
      {tab === PermitV2Tab.Create && (
        <>
          Select the type of Permit you wish to create and select your options.
          <br />
          <span className="italic">- If you are connected with an EOA, you will be prompted for a signature.</span>
          <br />
          <span className="italic">- The created Permit will be set as your default.</span>
        </>
      )}
      {tab === PermitV2Tab.Import && (
        <>
          Import a fully-formed Permit and set it as your default. Imported Permits cannot be edited.
          <br />
          <span className="italic">
            - You may import either your own Permit, or a Permit that has been shared with you.
          </span>
          <br />
          <span className="italic">
            - If you are connected with an EOA, you may be prompted for a signature if necessary.
          </span>
        </>
      )}
      {tab === PermitV2Tab.Select && <>Select an existing Permit from your list of available Permits below:</>}
      {tab === PermitV2Tab.Details && <>Permit Details:</>}
    </div>
  );
};
