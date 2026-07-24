import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/home/section-header";

const testimonials = [
  {
    quote:
      "The jollof tasted like a proper party — smoky, hot, and delivered on time for our office lunch.",
    name: "Ada O.",
    role: "Office manager, Lagos",
  },
  {
    quote:
      "Ordered for a small family gathering. Portions were generous and the WhatsApp checkout was so easy.",
    name: "Chidi M.",
    role: "Customer",
  },
  {
    quote:
      "We stocked rice, oil, and frozen chicken in one go. Fresh quality and clear communication.",
    name: "Funke A.",
    role: "Home cook",
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-b border-border/70 bg-background py-16 sm:py-20">
      <Container>
        <SectionHeader
          title="Loved by hungry people"
          description="Stories from customers who order meals, catering, and groceries."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote
              key={item.name}
              className="flex flex-col justify-between space-y-6 rounded-2xl bg-muted/40 p-6 ring-1 ring-border"
            >
              <p className="text-sm leading-relaxed text-foreground">
                “{item.quote}”
              </p>
              <footer>
                <cite className="font-heading not-italic text-sm font-semibold text-primary">
                  {item.name}
                </cite>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </Container>
    </section>
  );
}
