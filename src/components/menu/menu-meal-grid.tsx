"use client";

import { motion } from "framer-motion";
import { MenuMealCard } from "@/components/menu/menu-meal-card";
import type { Meal } from "@/types/catalog";

export function MenuMealGrid({ meals }: { meals: Meal[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.04 } },
      }}
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {meals.map((meal, index) => (
        <MenuMealCard key={meal.id} meal={meal} index={index} />
      ))}
    </motion.div>
  );
}
