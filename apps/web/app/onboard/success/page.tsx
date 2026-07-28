import Link from "next/link";
import ComplyUpsellCard from "@/components/onboarding/ComplyUpsellCard";
import FormationCompletedTracker from "@/components/onboarding/FormationCompletedTracker";
import { getRegistrationById } from "@/lib/queries/registrations";
import { PAID_REGISTRATION_STATUSES } from "@/lib/registrationStatus";

// The `registration` query param is just an ID a client redirected with —
// nothing here has verified the webhook actually confirmed payment yet, so
// this can't claim "confirmed" for any ID typed into the URL. Look the
// registration's real status up server-side instead of asserting it.
export default async function OnboardSuccessPage({
  searchParams,
}: {
  searchParams: { registration?: string };
}) {
  const registrationId = searchParams.registration;
  const registration = registrationId ? await getRegistrationById(registrationId) : null;
  const isConfirmed = !!registration && (PAID_REGISTRATION_STATUSES as readonly string[]).includes(registration.status);

  return (
    <div className="max-w-xl mx-auto text-center py-20 px-6">
      <FormationCompletedTracker registrationId={searchParams.registration} />
      <div className="w-20 h-20 rounded-full bg-teal-pale flex items-center justify-center text-4xl mx-auto mb-6">
        🎉
      </div>
      <h2 className="text-2xl font-serif font-bold text-navy mb-3">You&apos;re on your way!</h2>
      <p className="text-gray-500 mb-8">
        Your FormRight account has been created and your formation has been initiated.
        {registrationId && isConfirmed && (
          <>
            {" "}
            Registration <strong>{registrationId}</strong> is confirmed. Check your email for next steps.
          </>
        )}
        {registrationId && !isConfirmed && (
          <>
            {" "}
            We&apos;re finalizing registration <strong>{registrationId}</strong> — you&apos;ll get an
            email as soon as your payment is confirmed.
          </>
        )}
      </p>
      {searchParams.registration && (
        <ComplyUpsellCard registrationId={searchParams.registration} />
      )}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left mb-8">
        <h4 className="font-semibold text-navy mb-4">What Happens Next</h4>
        <ol className="flex flex-col gap-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-teal text-white text-xs flex items-center justify-center shrink-0">1</span>
            Review your auto-generated documents (ready in ~2 minutes)
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-teal text-white text-xs flex items-center justify-center shrink-0">2</span>
            Our team will review and prepare your state filing within 1-2 business days
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-teal text-white text-xs flex items-center justify-center shrink-0">3</span>
            You&apos;ll receive your state confirmation within 1-4 weeks
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-teal text-white text-xs flex items-center justify-center shrink-0">4</span>
            Apply for your EIN with the IRS (FormRight guides you through this step)
          </li>
        </ol>
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold bg-gold text-navy shadow-gold hover:bg-[#FFB300] transition-colors"
        >
          Sign In to My Dashboard →
        </Link>
      </div>
    </div>
  );
}
