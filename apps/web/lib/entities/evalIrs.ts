export type IrsAnswer = "yes" | "no" | null;

export interface IrsScreeningAnswers {
  gross: IrsAnswer; // projected receipts exceed $50,000?
  assets: IrsAnswer; // total assets exceed $250,000?
  church: IrsAnswer; // church, school, or hospital?
  revoked: IrsAnswer; // prior tax-exempt revocation?
}

export type IrsScreeningResult =
  | { status: "unanswered" }
  | { status: "disqualified"; reasons: string[] }
  | { status: "qualifies" };

// Ported from evalIrs() (line 27641) — 1023 vs 1023-EZ screening logic.
export function evalIrs(answers: IrsScreeningAnswers): IrsScreeningResult {
  const { gross, assets, church, revoked } = answers;

  const disqualified =
    gross === "yes" || // exceeds $50k receipts
    assets === "yes" || // exceeds $250k assets
    church === "yes" || // church/school/hospital must use full 1023
    revoked === "yes"; // prior revocation requires full 1023

  if (disqualified) {
    const reasons: string[] = [];
    if (gross === "yes") reasons.push("projected receipts exceed $50,000");
    if (assets === "yes") reasons.push("total assets exceed $250,000");
    if (church === "yes") reasons.push("churches, schools, and hospitals must use the full 1023");
    if (revoked === "yes") reasons.push("prior tax-exempt revocation requires the full 1023");
    return { status: "disqualified", reasons };
  }

  if (gross !== null || assets !== null || church !== null || revoked !== null) {
    return { status: "qualifies" };
  }

  return { status: "unanswered" };
}
