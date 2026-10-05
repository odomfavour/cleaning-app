"use client";
import { Button as UiButton } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Building2, Banknote, Bell, Phone, Sparkles, Users } from "lucide-react";
import { PageHeader } from "@/components/kit/Page";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { Input, Select, Textarea } from "@/components/kit/Field";
import { Switch } from "@/components/kit/Misc";
import { org } from "@/lib/config";
import { cn } from "@/lib/utils";

const sections = [{ id: "org", label: "Organization", icon: Building2 }, { id: "contact", label: "Contact details", icon: Phone }, { id: "services", label: "Services", icon: Sparkles }, { id: "notify", label: "Notifications", icon: Bell }, { id: "pay", label: "Payments", icon: Banknote }, { id: "staff", label: "Staff", icon: Users }] as const;
type Id = (typeof sections)[number]["id"];

export default function SettingsPage() {
  const [tab, setTab] = useState<Id>("org");
  const [n, setN] = useState({ newReq: true, payment: true, review: true, daily: false });
  const [p, setP] = useState({ card: true, bank: true, ussd: false });
  const [s, setS] = useState({ autoAssign: false, photos: true });
  const [saving, setSaving] = useState(false);
  const save = async (what: string) => { setSaving(true); await new Promise((r) => setTimeout(r, 600)); setSaving(false); toast.success(`${what} saved`); };
  const saveBtn = (what: string) => <Button onClick={() => save(what)} loading={saving}>Save changes</Button>;
  return (
    <>
      <PageHeader title="Settings" description="Organization details and how the platform behaves." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Settings sections" className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0 [scrollbar-width:none]">
          {sections.map((x) => <UiButton key={x.id} variant={tab === x.id ? "outline" : "ghost"} onClick={() => setTab(x.id)} aria-current={tab === x.id} className={cn("h-auto shrink-0 justify-start gap-2.5 px-3 py-2.5 font-medium", tab === x.id ? "text-primary shadow-sm" : "text-muted-foreground")}><x.icon />{x.label}</UiButton>)}
        </nav>
        <div className="max-w-2xl">
          {tab === "org" && <Card><CardHeader title="Organization profile" /><CardBody className="space-y-4"><Input label="Business name" defaultValue={org.name} /><Input label="Tagline" defaultValue={org.tagline} /><Textarea label="Short description" rows={3} defaultValue="Professional cleaning for homes, offices and commercial spaces across Port Harcourt." /><Input label="Registration number" defaultValue="RC 1894423" />{saveBtn("Organization profile")}</CardBody></Card>}
          {tab === "contact" && <Card><CardHeader title="Contact details" description="Shown on quotes and the website." /><CardBody className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Input label="Phone" defaultValue={org.phone} /><Input label="Email" type="email" defaultValue={org.email} /></div><Input label="Address" defaultValue={org.address} /><Input label="Business hours" defaultValue={org.hours} />{saveBtn("Contact details")}</CardBody></Card>}
          {tab === "services" && <Card><CardHeader title="Service defaults" /><CardBody className="space-y-4"><Select label="Quote validity" defaultValue="7" options={[{ value: "3", label: "3 days" }, { value: "7", label: "7 days" }, { value: "14", label: "14 days" }, { value: "30", label: "30 days" }]} /><Textarea label="Default quote terms" rows={5} defaultValue="Payment in full is required to confirm your booking." /><div className="flex flex-wrap gap-3">{saveBtn("Service defaults")}<Button variant="secondary" href="/admin/services">Manage services</Button></div></CardBody></Card>}
          {tab === "notify" && <Card><CardHeader title="Notifications" /><CardBody className="divide-y divide-border py-2"><Switch label="New requests" description="Email when a customer submits a request." checked={n.newReq} onChange={(v) => setN({ ...n, newReq: v })} /><Switch label="Payments" description="Email when a payment is received or fails." checked={n.payment} onChange={(v) => setN({ ...n, payment: v })} /><Switch label="Reviews" description="Email when a customer leaves a review." checked={n.review} onChange={(v) => setN({ ...n, review: v })} /><Switch label="Daily summary" description="A morning digest of today's jobs." checked={n.daily} onChange={(v) => setN({ ...n, daily: v })} /><div className="pt-4">{saveBtn("Notifications")}</div></CardBody></Card>}
          {tab === "pay" && <Card><CardHeader title="Payment settings" /><CardBody className="space-y-4"><div className="divide-y divide-border"><Switch label="Card payments" checked={p.card} onChange={(v) => setP({ ...p, card: v })} /><Switch label="Bank transfer" checked={p.bank} onChange={(v) => setP({ ...p, bank: v })} /><Switch label="USSD" checked={p.ussd} onChange={(v) => setP({ ...p, ussd: v })} /></div><div className="grid gap-4 sm:grid-cols-2"><Input label="Bank name" defaultValue="Zenith Bank" /><Input label="Account number" defaultValue="2034567890" /></div><Input label="Account name" defaultValue="Cleanin Services Ltd" /><p className="text-sm text-muted-foreground">Payment gateway keys are configured on the server once the backend is connected.</p>{saveBtn("Payment settings")}</CardBody></Card>}
          {tab === "staff" && <Card><CardHeader title="Staff settings" /><CardBody className="space-y-4"><div className="divide-y divide-border"><Switch label="Require before/after photos" description="Staff must upload photos to complete a job." checked={s.photos} onChange={(v) => setS({ ...s, photos: v })} /><Switch label="Auto-suggest staff" description="Suggest available staff when a booking is confirmed." checked={s.autoAssign} onChange={(v) => setS({ ...s, autoAssign: v })} /></div><Select label="Default team size" defaultValue="2" options={[1, 2, 3, 4].map((x) => ({ value: String(x), label: `${x} ${x > 1 ? "people" : "person"}` }))} /><div className="flex flex-wrap gap-3">{saveBtn("Staff settings")}<Button variant="secondary" href="/admin/staff">Manage staff</Button></div></CardBody></Card>}
        </div>
      </div>
    </>
  );
}
