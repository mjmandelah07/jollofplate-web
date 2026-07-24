import type { Metadata } from "next";
import { MealsManager } from "@/components/admin/meals/meals-manager";

export const metadata: Metadata = {
  title: "Meals",
  robots: { index: false, follow: false },
};

export default function AdminMealsPage() {
  return <MealsManager />;
}
