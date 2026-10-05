import { CreditCard, FileText, UserX } from "lucide-react";
import { PageHeader } from "@/components/kit/Page";
import { RequestForm } from "@/components/request-form/RequestForm";

export const metadata = { title: "Request a cleaning" };

export default function PublicRequestCleaningPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Request a cleaning" description="Tell us what you need cleaned. Submitting a request doesn't confirm a booking. We review it and send you a quotation." />
      <ul className="-mt-2 mb-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80">
        <li className="flex items-center gap-2"><UserX className="h-4 w-4 text-blue-700" />No account needed</li>
        <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-blue-700" />No payment now</li>
        <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-700" />Itemised quotation before you commit</li>
      </ul>
      <RequestForm mode="public" />
    </div>
  );
}
