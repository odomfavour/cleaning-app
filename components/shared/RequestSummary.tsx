import { MapPin, CalendarClock } from "lucide-react";
import { Card, CardBody, CardHeader, DetailList } from "@/components/kit/Card";
import { Badge } from "@/components/kit/Badge";
import { PhotoGrid } from "@/components/kit/FileUploader";
import { fmtLong, fmtTime } from "@/lib/utils";
import { AdminRequestDetail } from "@/lib/api/services/admin-cleaning-requests.service";

type PropertyItem = {
  label: string;
  value: string;
};

const propLabels: Record<string, string> = {
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  livingRooms: "Living rooms",
  floors: "Floors",
  kitchen: "Kitchen",
  rooms: "Rooms",
  size: "Approx. size",
  additional: "Additional areas",
};
// test 
export const propertyItems = (
  p:
    | {
      bedrooms?: string;
      bathrooms?: string;
      livingRooms?: string;
      floors?: string;
      kitchen?: string;
      rooms?: string;
      size?: string;
      additional?: string;
    }
    | undefined,
): PropertyItem[] => {
  if (!p) return [];

  return Object.entries(p)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => ({
      label: propLabels[key] ?? key,
      value: String(value),
    }));
};
type RequestSummaryProps = {
  r: AdminRequestDetail["request"];
  bare?: boolean;
};

function Block({
  bare,
  title,
  children,
}: {
  bare?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return bare ? (
    <section className="border-b border-border py-5 first:pt-0 last:border-0 last:pb-0">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  ) : (
    <Card>
      <CardHeader title={title} />
      <CardBody>{children}</CardBody>
    </Card>
  );
}

/** Read-only view of everything the customer submitted. Shared by customer, admin and wizard review. */
export function RequestSummary({ r, bare = false }: RequestSummaryProps) {
  const summaryPropertyItems = [
    r.bedrooms !== undefined
      ? { label: "Bedrooms", value: String(r.bedrooms) }
      : null,

    r.bathrooms !== undefined
      ? { label: "Bathrooms", value: String(r.bathrooms) }
      : null,

    r.propertyDetails.rooms !== undefined
      ? { label: "Rooms", value: String(r.propertyDetails.rooms) }
      : null,

    r.propertyDetails.livingRooms !== undefined
      ? {
        label: "Living rooms",
        value: String(r.propertyDetails.livingRooms),
      }
      : null,

    r.propertyDetails.floors !== undefined
      ? { label: "Floors", value: String(r.propertyDetails.floors) }
      : null,

    r.propertyDetails.kitchens !== undefined
      ? { label: "Kitchens", value: String(r.propertyDetails.kitchens) }
      : null,

    r.propertyDetails.size
      ? { label: "Size", value: String(r.propertyDetails.size) }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className={bare ? "" : "space-y-5"}>
      <Block bare={bare} title="Environment and services">
        <p className="mb-3 text-[15px] font-medium text-foreground">
          {r.propertyDetails.environment ?? "—"}
        </p>

        <div className="flex flex-wrap gap-2">
          {r.requestedServices.map((service) => (
            <Badge key={service.serviceId} tone="info">
              {service.name}
            </Badge>
          ))}
        </div>
      </Block>

      <Block bare={bare} title="Property details">
        {summaryPropertyItems.length ? (
          <DetailList cols={3} items={summaryPropertyItems} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No property details provided.
          </p>
        )}
      </Block>

      <Block bare={bare} title="Cleaning details">
        <DetailList
          cols={1}
          items={[
            {
              label: "Additional details",
              value: r.propertyDetails.additional ?? "—",
            },
            {
              label: "Notes",
              value: r.notes ?? "—",
            },
          ]}
        />

        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Photos ({r.photos.length})
          </p>

          {r.photos.length ? (
            <PhotoGrid photos={r.photos} alt="Space photo" />
          ) : (
            <p className="text-sm text-muted-foreground">No photos provided.</p>
          )}
        </div>
      </Block>

      <Block bare={bare} title="Location and schedule">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

            <div className="text-[15px] text-foreground">
              <p>{r.address.addressLine1}</p>

              {r.address.addressLine2 && <p>{r.address.addressLine2}</p>}

              <p className="text-muted-foreground">
                {[r.address.area, r.address.city, r.address.state]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {r.address.postalCode && (
                <p className="text-sm text-muted-foreground">
                  {r.address.postalCode}
                </p>
              )}

              {r.address.landmark && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Landmark: {r.address.landmark}
                </p>
              )}

              {r.address.directions && (
                <p className="text-sm text-muted-foreground">
                  {r.address.directions}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

            <div className="text-[15px] text-foreground">
              {r.preferredDate ? (
                <>
                  <p>{fmtLong(r.preferredDate)}</p>

                  {r.preferredTimeSlot && (
                    <p className="text-muted-foreground">
                      {fmtTime(r.preferredTimeSlot)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">
                  No preferred date provided.
                </p>
              )}

              {r.schedule.flexible && (
                <p className="mt-1 text-sm font-medium text-blue-700">
                  Flexible on date and time
                </p>
              )}

              {r.schedule.alternativeDate && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Alternative: {fmtLong(r.schedule.alternativeDate)}
                  {r.schedule.alternativeTimeSlot
                    ? `, ${fmtTime(r.schedule.alternativeTimeSlot)}`
                    : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </Block>
    </div>
  );
}
