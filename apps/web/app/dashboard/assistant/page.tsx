import AssistantChat from "@/components/dashboard/AssistantChat";

export default function AssistantPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-navy">Assistant</h1>
        <p className="text-gray-500 text-sm mt-1">
          Questions about your formation, filing status, or compliance deadlines.
        </p>
      </div>
      <AssistantChat />
    </div>
  );
}
