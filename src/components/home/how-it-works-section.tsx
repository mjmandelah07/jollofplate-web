import { MessageCircle, ShoppingCart, Utensils } from "lucide-react";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/home/section-header";

const steps = [
  {
    title: "Browse the menu",
    description: "Pick meals, priced groceries, custom shopping, or catering.",
    icon: Utensils,
  },
  {
    title: "Add to cart",
    description: "Choose extras and quantities — your cart stays with you.",
    icon: ShoppingCart,
  },
  {
    title: "Pay on WhatsApp",
    description: "We send your order details so checkout is fast and clear.",
    icon: MessageCircle,
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <Container>
        <SectionHeader
          align="center"
          title="How it works"
          description="Order in minutes. No online payment gateway — just WhatsApp."
        />
        <ol className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-secondary uppercase">
                  Step {index + 1}
                </p>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
