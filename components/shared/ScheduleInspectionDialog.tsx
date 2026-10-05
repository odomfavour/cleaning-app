"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Dialog } from "@/components/kit/Dialog";
import { Button } from "@/components/kit/Button";
import { DatePicker, Select, TimePicker } from "@/components/kit/Field";
import { MIN_DATE } from "@/components/request-form/schema";
import { useAdminStaff } from "@/lib/hooks/queries/use-admin-staff";
import { useScheduleAdminInspection } from "@/lib/hooks/queries/use-admin-inspections";

type ScheduleInspectionDialogProps = {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
  requestId: string;
};

export function ScheduleInspectionDialog({
  open,
  onClose,
  onDone,
  requestId,
}: ScheduleInspectionDialogProps) {
  const [inspector, setInspector] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [touched, setTouched] = useState(false);

  const { data: staff = [], isLoading: staffLoading } = useAdminStaff();
  console.log("staff", staff);

  const scheduleMutation = useScheduleAdminInspection();

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInspector("");
      setDate("");
      setTime("");
      setTouched(false);
    }
  }, [open]);

  const choices = staff.filter(
    (member) =>
      member.active &&
      member.availability === "available" &&
      (member.role === "Inspector" || member.role === "Team Lead"),
  );

  const submit = async () => {
    setTouched(true);

    if (!requestId || !inspector || !date || !time) {
      return;
    }

    try {
      await scheduleMutation.mutateAsync({
        requestId,
        inspectorId: inspector,
        date,
        time,
      });

      toast.success("Inspection scheduled.");

      onDone();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to schedule inspection.",
      );
    }
  };

  const error = (value: string) => (touched && !value ? "Required" : undefined);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Schedule inspection"
      description="Visit the location before quoting. The customer is notified automatically."
      size="sm"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={scheduleMutation.isPending}
          >
            Cancel
          </Button>

          <Button
            onClick={submit}
            loading={scheduleMutation.isPending}
            disabled={staffLoading || choices.length === 0}
          >
            Schedule
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Inspector"
          placeholder={
            staffLoading
              ? "Loading inspectors..."
              : choices.length === 0
                ? "No inspectors available"
                : "Assign an inspector"
          }
          value={inspector}
          onChange={(event) => setInspector(event.target.value)}
          error={error(inspector)}
          options={choices.map((member) => ({
            value: member.id,
            label: `${member.name} (${member.role})`,
          }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <DatePicker
            label="Date"
            min={MIN_DATE}
            value={date}
            onChange={setDate}
            error={error(date)}
          />

          <TimePicker
            label="Time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            error={error(time)}
          />
        </div>
      </div>
    </Dialog>
  );
}
