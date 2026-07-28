// Regression coverage for a real bug: onboardStore had no way to clear the
// wizard back to a blank slate. It's a module-level singleton store, not
// reset on client-side navigation, so re-entering the wizard without a full
// page reload (e.g. after abandoning a formation and starting over) resumed
// with the previous attempt's name/address/board/plan/addons still filled in.
import { describe, it, expect, beforeEach } from "vitest";
import { useOnboardStore } from "@/lib/store/onboardStore";

describe("onboardStore — reset", () => {
  beforeEach(() => {
    useOnboardStore.getState().reset();
  });

  it("clears fields that were filled in during a previous session", () => {
    const s = useOnboardStore.getState();
    s.setField("orgname", "Old Co");
    s.setField("state", "Delaware");
    s.setField("step", 5);
    s.addBoardMember();
    s.selectPlan("premium");
    s.toggleAddon("rush");
    s.setIrsAnswer("gross", "yes");

    useOnboardStore.getState().reset();
    const after = useOnboardStore.getState();

    expect(after.orgname).toBe("");
    expect(after.state).toBe("");
    expect(after.step).toBe(1);
    expect(after.board).toHaveLength(3); // back to the 3 default officer slots
    expect(after.selectedPlanKey).toBeNull();
    expect(after.addonKeys.size).toBe(0);
    expect(after.irs.gross).toBeNull();
  });

  it("gives fresh, independently-mutable board/policies/irs/addonKeys, not shared references", () => {
    useOnboardStore.getState().reset();
    const first = useOnboardStore.getState();

    first.updateBoardMember(0, { name: "Alice" });
    first.togglePolicy("gift");
    first.toggleAddon("rush");

    useOnboardStore.getState().reset();
    const second = useOnboardStore.getState();

    // A prior reset's mutations must not leak into the next reset's state.
    expect(second.board[0].name).toBe("");
    expect(second.policies.gift).toBe(false);
    expect(second.addonKeys.size).toBe(0);
  });
});
