import { PageHeader } from "@/components/kit/Page";
import { RequestForm } from "@/components/request-form/RequestForm";

export const metadata = { title: "Request a cleaning" };

export default function DashboardRequestCleaningPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Request a cleaning" description="We've filled in your details. Submitting a request doesn't book anything. We review it and send you a quotation." />
      <RequestForm mode="account" />
    </div>
  );
}
