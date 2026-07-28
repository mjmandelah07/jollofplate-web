import Link from "next/link";
import {
  Building2,
  Package,
  PartyPopper,
  ShoppingBasket,
  UtensilsCrossed,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/home/section-header";

type Service = {
  title: string;
  description: string;
  href: string;
  icon: typeof UtensilsCrossed;
};

export function ServicesSection({
  groceriesHref = "/menu",
}: {
  groceriesHref?: string;
}) {
  const services: Service[] = [
    {
      title: "Food ordering",
      description:
        "Order meals online — jollof, sides, and more. Delivery or pickup in Ikorodu, Lagos.",
      href: "/menu",
      icon: UtensilsCrossed,
    },
    {
      title: "Catering",
      description:
        "Parties, events, and celebrations — trays of authentic party jollof.",
      href: "/menu",
      icon: PartyPopper,
    },
    {
      title: "Groceries",
      description:
        "Rice, oils, Maggi, frozen foods, and pantry staples with clear prices.",
      href: groceriesHref,
      icon: Package,
    },
    {
      title: "Custom shopping",
      description:
        "Need something else? Submit a shopping request — we quote on WhatsApp.",
      href: "/custom-shopping",
      icon: ShoppingBasket,
    },
    {
      title: "Corporate lunch",
      description:
        "Reliable office and team lunch orders delivered hot and on time.",
      href: "/menu",
      icon: Building2,
    },
  ];

  return (
    <section className="border-b border-border/70 bg-background py-16 sm:py-20">
      <Container>
        <SectionHeader
          title="What we offer"
          description="Meals, priced groceries, custom shopping requests, catering, and office lunch from Ikorodu."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.title}
                href={service.href}
                className="group space-y-3 rounded-2xl p-1 transition-colors"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
