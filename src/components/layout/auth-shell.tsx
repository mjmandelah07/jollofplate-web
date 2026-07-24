import Image from "next/image";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
  image,
  imageAlt,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  image?: string;
  imageAlt?: string;
}) {
  const form = (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-3 text-center">
        <Logo size="lg" href="/" />
        <h1 className="font-heading text-2xl font-bold text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {children}
      </div>
      {footer ? (
        <div className="text-center text-sm text-muted-foreground">
          {footer}
        </div>
      ) : null}
    </div>
  );

  if (!image) {
    return (
      <main
        className={cn(
          "flex min-h-full flex-1 flex-col items-center justify-center bg-background px-4 py-12",
          className,
        )}
      >
        {form}
      </main>
    );
  }

  return (
    <main
      className={cn("flex min-h-svh flex-1 bg-background", className)}
    >
      <div className="relative hidden flex-1 lg:block">
        <Image
          src={image}
          alt={imageAlt ?? title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 0px, 50vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--foreground)_35%,transparent),transparent_60%)]"
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {form}
      </div>
    </main>
  );
}
