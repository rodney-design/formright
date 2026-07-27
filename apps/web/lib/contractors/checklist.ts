// Fixed QA checklist seeded on every state filing once a contractor is
// assigned — a minimal, hardcoded list rather than a configurable workflow
// engine, per the scope of what a manual worksheet-transcription job
// actually needs (see lib/state-filing/worksheet.ts for the worksheet these
// steps walk through).
export const DEFAULT_FILING_CHECKLIST: string[] = [
  "Confirm worksheet fields match the registration record",
  "Log into the state's filing portal and submit the Articles",
  "Record the state confirmation ID once issued",
  "Upload the stamped certificate once the state returns it",
  "Mark the filing as approved and notify the admin team",
];
