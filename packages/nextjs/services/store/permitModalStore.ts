import { useAccount } from "@account-kit/react";
import { useCallback, useMemo } from "react";
import { create } from "zustand";
import { PermitV2 } from "~~/permits/permitV2";
import { getActivePermitHash } from "~~/permits/store";
import { SerializedPermitV2 } from "~~/permits/types";

export enum PermitV2Tab {
  About = "About",
  Create = "Create",
  Import = "Import",
  Select = "Select",
  Details = "Details",
}

export enum PermitV2CreateType {
  Using = "Using",
  Sharing = "Sharing",
}

type PermitV2CreateOptions = {
  name: string;
  type: PermitV2CreateType;
  recipient: string;
  expirationOffset: number;
  contracts: string[];
  projects: string[];
};

type PermitV2AccessRequirements = {
  contracts: string[];
  projects: string[];
};

type PermitV2AccessRequirementsParams =
  | {
      contracts?: never[];
      projects: string[];
    }
  | {
      contracts: string[];
      projects?: never[];
    };

type PermitModalState = {
  open: boolean;
  tab: PermitV2Tab;
  focusedPermitHash: string | undefined;
  createOptions: PermitV2CreateOptions;
  importingPermit: SerializedPermitV2 | undefined;
  // ----
  accessRequirements: PermitV2AccessRequirements;
};

const initialCreateOptions: PermitV2CreateOptions = {
  name: "",
  type: PermitV2CreateType.Using,
  recipient: "",
  expirationOffset: 24 * 60 * 60,
  contracts: [],
  projects: [],
};

export const usePermitModalStore = create<PermitModalState>(() => ({
  open: false,
  tab: PermitV2Tab.Create,
  focusedPermitHash: undefined,
  createOptions: initialCreateOptions,
  importingPermit: undefined,
  // ----
  accessRequirements: {
    contracts: [],
    projects: [],
  },
}));

/**
 * Set the requirements for user's permits
 * Requirements can either be set as a list of contract addresses
 * OR a list of project ids (ex: "FHERC20").
 *
 * NOTE: Cannot use lists of both contracts and projects.
 */
export const useInitializePermitModalAccessRequirements = (accessRequirements: PermitV2AccessRequirementsParams) => {
  initialCreateOptions.contracts = accessRequirements.contracts ?? [];
  initialCreateOptions.projects = accessRequirements.projects ?? [];

  usePermitModalStore.setState({
    accessRequirements: {
      contracts: accessRequirements.contracts ?? [],
      projects: accessRequirements.projects ?? [],
    },
    createOptions: initialCreateOptions,
  });
};

export const usePermitModalOpen = () => {
  const { address } = useAccount({ type: "LightAccount" });

  const open = usePermitModalStore(state => state.open);

  const setOpen = useCallback((open: boolean, selectedTab?: PermitV2Tab) => {
    const tab = selectedTab ?? getActivePermitHash(address) == null ? PermitV2Tab.Create : PermitV2Tab.Select;
    if (open) {
      usePermitModalStore.setState({ open, tab });
    } else {
      // Close and clear much of the state
      usePermitModalStore.setState({
        open,
        tab,
        focusedPermitHash: undefined,
        importingPermit: undefined,
        createOptions: initialCreateOptions,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { open, setOpen };
};

export const usePermitModalTab = () => {
  const tab = usePermitModalStore(state => state.tab);
  const setTab = useCallback((tab: PermitV2Tab) => {
    usePermitModalStore.setState({ tab, importingPermit: undefined });
  }, []);

  return { tab, setTab };
};

export const usePermitModalFocusedPermitHash = () => {
  const focusedPermitHash = usePermitModalStore(state => state.focusedPermitHash);
  const setFocusedPermitHash = useCallback((focusedPermitHash: string) => {
    usePermitModalStore.setState({ focusedPermitHash, tab: PermitV2Tab.Details });
  }, []);

  return { focusedPermitHash, setFocusedPermitHash };
};

export const usePermitCreateOptions = () => usePermitModalStore(state => state.createOptions);

export const usePermitCreateOptionsAndActions = () => {
  const createOptions = usePermitModalStore(state => state.createOptions);
  const accessRequirements = usePermitModalStore(state => state.accessRequirements);

  const accessSatisfiesRequirements = useMemo(() => {
    // Set to true if requirements includes some contracts
    let contractsSatisfied = accessRequirements.contracts.length > 0;
    for (const contract of accessRequirements.contracts) {
      if (!createOptions.contracts.includes(contract)) {
        contractsSatisfied = false;
      }
    }

    // Set to true if requirements includes some projects
    let projectsSatisfied = accessRequirements.projects.length > 0;
    for (const project of accessRequirements.projects) {
      if (!createOptions.projects.includes(project)) {
        projectsSatisfied = false;
      }
    }

    // Only need to satisfy one of the options to satisfy the requirements
    if (contractsSatisfied || projectsSatisfied) return true;

    return false;
  }, [createOptions, accessRequirements]);

  const setName = useCallback((name: string) => {
    usePermitModalStore.setState(state => ({ createOptions: { ...state.createOptions, name } }));
  }, []);

  const setType = useCallback((type: PermitV2CreateType) => {
    usePermitModalStore.setState(state => ({ createOptions: { ...state.createOptions, type } }));
  }, []);

  const setRecipient = useCallback((recipient: string) => {
    usePermitModalStore.setState(state => ({ createOptions: { ...state.createOptions, recipient } }));
  }, []);

  const setExpirationOffset = useCallback((expirationOffset: number) => {
    usePermitModalStore.setState(state => ({ createOptions: { ...state.createOptions, expirationOffset } }));
  }, []);

  const addContract = useCallback((contract: string) => {
    usePermitModalStore.setState(state => ({
      createOptions: { ...state.createOptions, contracts: [...state.createOptions.contracts, contract] },
    }));
  }, []);
  const removeContract = useCallback((contract: string) => {
    usePermitModalStore.setState(state => ({
      createOptions: {
        ...state.createOptions,
        contracts: state.createOptions.contracts.filter(c => c !== contract),
      },
    }));
  }, []);

  const addProject = useCallback((project: string) => {
    usePermitModalStore.setState(state => ({
      createOptions: { ...state.createOptions, projects: [...state.createOptions.projects, project] },
    }));
  }, []);
  const removeProject = useCallback((project: string) => {
    usePermitModalStore.setState(state => ({
      createOptions: {
        ...state.createOptions,
        projects: state.createOptions.projects.filter(c => c !== project),
      },
    }));
  }, []);

  const reset = useCallback(() => {
    usePermitModalStore.setState(state => ({
      createOptions: {
        ...initialCreateOptions,
        contracts: state.accessRequirements.contracts,
        projects: state.accessRequirements.projects,
      },
    }));
  }, []);

  return {
    ...createOptions,
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
  };
};

export const usePermitSatisfiesRequirements = (permit: PermitV2 | undefined) => {
  const accessRequirements = usePermitModalStore(state => state.accessRequirements);
  return useMemo(() => {
    if (permit == null) return false;

    // Set to true if requirements includes some contracts
    let contractsSatisfied = accessRequirements.contracts.length > 0;
    for (const contract of accessRequirements.contracts) {
      if (!permit.contracts.includes(contract)) {
        contractsSatisfied = false;
      }
    }

    // Set to true if requirements includes some projects
    let projectsSatisfied = accessRequirements.projects.length > 0;
    for (const project of accessRequirements.projects) {
      if (!permit.projects.includes(project)) {
        projectsSatisfied = false;
      }
    }

    // Only need to satisfy one of the options to satisfy the requirements
    if (contractsSatisfied || projectsSatisfied) return true;

    return false;
  }, [permit, accessRequirements]);
};

export const usePermitModalImporting = () => {
  const importingPermit = usePermitModalStore(state => {
    if (state.importingPermit == null) return undefined;
    return PermitV2.deserialize(state.importingPermit);
  });
  const setImportingPermit = useCallback((importingPermit: PermitV2 | undefined) => {
    usePermitModalStore.setState({ importingPermit: importingPermit?.serialize() });
  }, []);

  return { importingPermit, setImportingPermit };
};

export const usePermitModalUpdateImportingPermitName = () => {
  return useCallback((name: string) => {
    usePermitModalStore.setState(state => {
      if (state.importingPermit == null) return {};
      const permit = PermitV2.deserialize(state.importingPermit);
      permit.updateName(name);
      return { importingPermit: permit.serialize() };
    });
  }, []);
};
