import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Menu",
  description:
    "Browse jollof rice, fried rice, swallow and soups, sides, groceries, and frozen foods. Order for delivery or pickup in Ikorodu, Lagos.",
  path: "/menu",
});

export default function MenuPage() {
  return (
    <Container className="py-12">
      <h1 className="font-heading text-3xl font-bold text-foreground">Menu</h1>
      <p className="mt-2 text-muted-foreground">
        Categories and meals will load here next.
      </p>
    </Container>
  );
}
