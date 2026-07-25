import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { DroppingChips } from "@/components/layout/dropping-chips";
import { Container } from "@/components/layout/container";
import {
  formatNaira,
  formatPhoneForWhatsApp,
} from "@/lib/format";
import { normalizeBusinessHours } from "@/lib/business-hours";
import type { RestaurantSettings, SocialLinks } from "@/types";

const socialItems: Array<{
  key: keyof SocialLinks;
  label: string;
  icon: ReactNode;
}> = [
  {
    key: "instagram",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4">
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
        <path d="M14.5 8.5V6.8c0-.7.5-1.3 1.2-1.3H17V3h-2.1C12.6 3 11 4.6 11 6.6v1.9H9v2.7h2V21h3.5v-9.8h2.4l.6-2.7h-3Z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "X",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
        <path d="M17.6 3H20l-6.4 7.3L21 21h-5.5l-4.3-5.6L6.2 21H3.8l6.9-7.8L3 3h5.6l3.9 5.2L17.6 3Zm-1.9 16.2h1.5L8.4 4.7H6.8l9 14.5Z" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
        <path d="M15.2 3c.3 2.1 1.6 3.6 3.8 3.9v2.5c-1.3 0-2.5-.4-3.6-1.1v5.7c0 3.5-2.8 6.2-6.4 6.2S2.6 17.5 2.6 14s2.8-6.2 6.4-6.2c.3 0 .7 0 1 .1v2.7c-.3-.1-.6-.2-1-.2-2 0-3.6 1.6-3.6 3.6s1.6 3.6 3.6 3.6 3.6-1.6 3.6-3.6V3h2.6Z" />
      </svg>
    ),
  },
];

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
  const activeSocials = socialItems.filter(
    (item) => Boolean(social?.[item.key]?.trim()),
  );

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
            {activeSocials.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {activeSocials.map((item) => (
                  <a
                    key={item.key}
                    href={social?.[item.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-background text-foreground/80 transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            ) : null}
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
            </ul>
          </div>
        </Container>
      </footer>

      <DroppingChips restaurantName={name} />
    </>
  );
}
