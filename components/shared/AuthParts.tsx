import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const FormAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive"><AlertCircle /><AlertDescription className="text-red-800">{message}</AlertDescription></Alert>
);
export function SuccessPanel({ title, children, action }: { title: string; children: React.ReactNode; action: React.ReactNode }) {
  return (
    <div className="animate-pop-in text-center" role="status">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></div>
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      <div className="mt-2 text-muted-foreground">{children}</div>
      <div className="mt-7">{action}</div>
    </div>
  );
}
