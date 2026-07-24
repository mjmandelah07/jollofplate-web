import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  description,
  align = "left",
  className,
}: {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 max-w-2xl space-y-2",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
