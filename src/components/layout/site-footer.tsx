import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { DroppingChips } from "@/components/layout/dropping-chips";
import { Container } from "@/components/layout/container";
import {
  formatNaira,
  formatPhoneForWhatsApp,
} from "@/lib/format";
import { normalizeBusinessHours } from "@/lib/business-hours";
import type { RestaurantSettings } from "@/types";

export function SiteFooter({ settings }: { settings: RestaurantSettings | null }) {
  const name = settings?.restaurantName ?? "JollofPlate";
  const email =
    settings?.email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
  const address =
    settings?.address || process.env.NEXT_PUBLIC_ADDRESS || "Ikorodu, Lagos, Nigeria";
  const contactNumber =
    settings?.contactNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const whatsapp = formatPhoneForWhatsApp(
    settings?.whatsappNumber ||
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
      "",
  );
  const hours = settings?.businessHours
    ? normalizeBusinessHours(settings.businessHours)
    : null;
  const social = settings?.socialLinks;

  return (
    <>
      <footer className="mt-auto border-t border-border bg-muted/40">
        <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo size="sm" />
            <p className="max-w-xs text-sm text-muted-foreground">
              Every Plate Tells a Story. Fresh, hot, authentic jollof — made to
              order in Ikorodu, Lagos.
            </p>
            <p className="text-sm font-medium text-foreground">
              Delivery &amp; pickup available
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Contact
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {address ? <li>{address}</li> : null}
              {email ? (
                <li>
                  <a href={`mailto:${email}`} className="hover:text-primary">
                    {email}
                  </a>
                </li>
              ) : null}
              {contactNumber ? (
                <li>
                  <a
                    href={`tel:+${formatPhoneForWhatsApp(contactNumber)}`}
                    className="hover:text-primary"
                  >
                    {contactNumber}
                  </a>
                </li>
              ) : null}
              {whatsapp ? (
                <li>
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent hover:underline"
                  >
                    Chat on WhatsApp
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Hours
            </h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {hours
                ? hours.week.map((day) => (
                    <li key={day.day} className="flex justify-between gap-4">
                      <span>{day.label.slice(0, 3)}</span>
                      <span>
                        {day.closed ? "Closed" : `${day.open}-${day.close}`}
                      </span>
                    </li>
                  ))
                : (
                  <li>Hours coming soon</li>
                )}
            </ul>
            {typeof settings?.deliveryFee === "number" ? (
              <p className="pt-2 text-sm text-foreground">
                Delivery from{" "}
                <span className="font-medium text-secondary">
                  {formatNaira(settings.deliveryFee)}
                </span>
              </p>
            ) : null}
          </div>

          <div className="space-y-3">
            <h2 className="font-heading text-sm font-semibold text-foreground">
              Explore
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/menu" className="hover:text-primary">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-primary">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary">
                  Login
                </Link>
              </li>
              {social?.instagram ? (
                <li>
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    Instagram
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </Container>
      </footer>

      <DroppingChips restaurantName={name} />
    </>
  );
}
