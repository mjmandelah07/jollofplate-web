import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { formatPhoneForWhatsApp } from "@/lib/format";

export function FinalCtaSection({
  whatsappNumber,
}: {
  whatsappNumber?: string;
}) {
  const wa = whatsappNumber
    ? formatPhoneForWhatsApp(whatsappNumber)
    : formatPhoneForWhatsApp(
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
      );
  const waHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent("Hi JollofPlate! I'd like to place an order.")}`
    : "/menu";

  return (
    <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_color-mix(in_srgb,var(--secondary)_45%,transparent),_transparent_55%)]"
      />
      <Container className="relative space-y-6 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Hungry? Let’s fill that plate.
        </h2>
        <p className="mx-auto max-w-xl text-sm text-primary-foreground/85 sm:text-base">
          Based in Ikorodu, Lagos — order jollof, groceries, or catering for
          delivery or pickup, then checkout on WhatsApp.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            variant="secondary"
            className="text-secondary-foreground"
            asChild
          >
            <Link href="/menu">Order now</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            asChild
          >
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              Chat on WhatsApp
            </a>
          </Button>
        </div>
      </Container>
    </section>
  );
}
