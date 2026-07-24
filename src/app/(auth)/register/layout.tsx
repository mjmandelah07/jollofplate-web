import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Create an account",
  description:
    "Create a JollofPlate account to save orders and checkout on WhatsApp in minutes.",
  path: "/register",
});

export default function CustomerRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
