import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl sm:text-3xl",
};

export function Logo({ href = "/", className, size = "md" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "font-heading font-bold tracking-tight text-primary",
        sizeClass[size],
        className,
      )}
    >
      JollofPlate
    </Link>
  );
}
