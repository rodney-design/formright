"use client";

import { create } from "zustand";
import { entityFamily, type EntityFamily } from "@/lib/entities/entityFamily";
import { getStateFee } from "@/lib/entities/stateFees";
import { ADDONS, getPlansForEntity } from "@/lib/entities/pricing";
import type { IrsAnswer } from "@/lib/entities/evalIrs";

export interface BoardMember {
  name: string;
  role: string;
  email: string;
}

export interface OnboardState {
  step: number; // 1-6

  // Step 1 — Organization
  orgname: string;
  orgtype: string; // raw dropdown value, e.g. "LLC — Single Member"
  state: string;
  fiscal: string;
  address: string;
  city: string;
  zip: string;
  ein: string;
  // California Nonprofit Corporation Law splits nonprofits into 3 statutory
  // sub-types with distinct required Articles language (Corp. Code Div. 2,
  // Parts 2/3/4 — see nonprofitStatutesTable.ts). Only shown/used when state
  // is California and orgtype is a nonprofit; "" means "not selected", in
  // which case the document generator derives a sensible default from
  // orgtype instead.
  caNonprofitSubtype: "" | "public_benefit" | "mutual_benefit" | "religious";

  // Step 2 — Mission & Programs
  mission: string;
  programs: string;
  geoArea: string;
  beneficiaries: string;
  revenue: string;

  // Step 3 — Board Members
  board: BoardMember[];
  registeredAgentName: string;
  registeredAgentAddress: string;

  // Step 4 — Governance
  meetingFrequency: string;
  quorum: string;
  termLength: string;
  termLimits: string;
  compensationPolicy: string;
  dissolutionClause: string;
  policies: {
    conflict: boolean;
    whistleblower: boolean;
    retention: boolean;
    gift: boolean;
    investment: boolean;
  };

  // Step 5 — IRS Screening
  irs: {
    gross: IrsAnswer;
    assets: IrsAnswer;
    church: IrsAnswer;
    revoked: IrsAnswer;
  };

  // Step 6 — Contact & Payment
  fname: string;
  lname: string;
  email: string;
  phone: string;
  selectedPlanKey: string | null;
  addonKeys: Set<string>;

  // actions
  setField: <K extends keyof OnboardState>(key: K, value: OnboardState[K]) => void;
  setIrsAnswer: (name: keyof OnboardState["irs"], value: IrsAnswer) => void;
  addBoardMember: () => void;
  updateBoardMember: (index: number, member: Partial<BoardMember>) => void;
  removeBoardMember: (index: number) => void;
  togglePolicy: (key: keyof OnboardState["policies"]) => void;
  selectPlan: (key: string) => void;
  toggleAddon: (key: string) => void;
  goToStep: (step: number) => void;

  // derived
  entityFamily: () => EntityFamily;
  stateFeeCents: () => number;
  planPriceCents: () => number;
  addonsCents: () => number;
  totalCents: () => number;
}

const initialState = {
  step: 1,
  orgname: "",
  orgtype: "",
  state: "",
  fiscal: "December 31",
  address: "",
  city: "",
  zip: "",
  ein: "",
  caNonprofitSubtype: "" as const,
  mission: "",
  programs: "",
  geoArea: "Local community",
  beneficiaries: "General public",
  revenue: "Under $50,000",
  board: [
    { name: "", role: "President", email: "" },
    { name: "", role: "Vice President", email: "" },
    { name: "", role: "Secretary", email: "" },
  ],
  registeredAgentName: "",
  registeredAgentAddress: "",
  meetingFrequency: "Quarterly (recommended)",
  quorum: "Majority (51%)",
  termLength: "2 years",
  termLimits: "No term limits",
  compensationPolicy: "All directors serve without compensation (volunteer)",
  dissolutionClause: "Assets distributed to other 501(c)(3) organizations (standard)",
  policies: {
    conflict: true,
    whistleblower: true,
    retention: true,
    gift: false,
    investment: false,
  },
  irs: { gross: null, assets: null, church: null, revoked: null } as OnboardState["irs"],
  fname: "",
  lname: "",
  email: "",
  phone: "",
  selectedPlanKey: null,
  addonKeys: new Set<string>(),
};

export const useOnboardStore = create<OnboardState>((set, get) => ({
  ...initialState,

  setField: (key, value) => set({ [key]: value } as Pick<OnboardState, typeof key>),

  setIrsAnswer: (name, value) => set((s) => ({ irs: { ...s.irs, [name]: value } })),

  addBoardMember: () =>
    set((s) => ({ board: [...s.board, { name: "", role: "Director", email: "" }] })),

  updateBoardMember: (index, member) =>
    set((s) => ({
      board: s.board.map((m, i) => (i === index ? { ...m, ...member } : m)),
    })),

  removeBoardMember: (index) =>
    set((s) => ({ board: s.board.filter((_, i) => i !== index) })),

  togglePolicy: (key) =>
    set((s) => ({ policies: { ...s.policies, [key]: !s.policies[key] } })),

  selectPlan: (key) => set({ selectedPlanKey: key }),

  toggleAddon: (key) =>
    set((s) => {
      const next = new Set(s.addonKeys);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { addonKeys: next };
    }),

  goToStep: (step) => set({ step }),

  entityFamily: () => entityFamily(get().orgtype),

  stateFeeCents: () => (getStateFee(get().state) ?? 0) * 100,

  planPriceCents: () => {
    const s = get();
    const plans = getPlansForEntity(s.entityFamily());
    const defaultPlan = plans.find((p) => p.featured) ?? plans[0];
    const plan = plans.find((p) => p.key === s.selectedPlanKey) ?? defaultPlan;
    return plan?.priceCents ?? 0;
  },

  addonsCents: () => {
    const s = get();
    return ADDONS.filter((a) => !a.recurring && s.addonKeys.has(a.key)).reduce((sum, a) => sum + a.priceCents, 0);
  },

  totalCents: () => {
    const s = get();
    return s.planPriceCents() + s.stateFeeCents() + s.addonsCents();
  },
}));
