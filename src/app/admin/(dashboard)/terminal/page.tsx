import type { Metadata } from "next";
import { TerminalManager } from "@/components/admin/terminal/terminal-manager";

export const metadata: Metadata = {
  title: "Terminal Africa",
  robots: { index: false, follow: false },
};

export default function AdminTerminalPage() {
  return <TerminalManager />;
}
