import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign in",
  description:
    "Sign in to your JollofPlate account to track orders and checkout faster.",
  path: "/login",
});

export default function CustomerLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
