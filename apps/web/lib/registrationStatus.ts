// Registration statuses that mean the customer actually paid. Shared so
// "does this registration count as paid" stays one definition instead of
// drifting across the document-download gate and the compliance-reminder
// cron query.
export const PAID_REGISTRATION_STATUSES = ["paid", "in_review", "filed", "complete"] as const;
