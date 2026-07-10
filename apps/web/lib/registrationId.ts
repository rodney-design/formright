// Ported format from completeOnboard() (line 26308): 'FR-' + 6 random digits.
export function generateRegistrationId(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `FR-${n}`;
}
