"use client";

import React from "react";
import { PermitV2Tab, usePermitModalTab } from "~~/services/store/permitModalStore";

const PermitV2TabOptions = [PermitV2Tab.Create, PermitV2Tab.Import, PermitV2Tab.Select];
export const PermitV2ModalTabs = () => {
  const { tab, setTab } = usePermitModalTab();
  return (
    <div className="flex flex-row gap-2 items-center justify-start">
      {PermitV2TabOptions.map((option, i) => (
        <React.Fragment key={option}>
          <button
            className={`btn btn-sm ${tab === option ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab(option)}
          >
            {option}
          </button>
          {i < PermitV2TabOptions.length - 1 && "/"}
        </React.Fragment>
      ))}
      {tab === PermitV2Tab.Details && (
        <>
          {"/"}
          <button className="btn btn-sm btn-primary">{tab}</button>
        </>
      )}
    </div>
  );
};
