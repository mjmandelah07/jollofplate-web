import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { MealDetail } from "@/components/menu/meal-detail";
import { RelatedMeals } from "@/components/menu/related-meals";
import { getMealBySlug, getRelatedMeals } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import { SITE_URL, absoluteAssetUrl, buildPageMetadata } from "@/lib/seo";
import type { Meal } from "@/types/catalog";

type MealPageProps = {
  params: Promise<{ slug: string }>;
};

async function loadMeal(slug: string): Promise<Meal | null> {
  try {
    return await getMealBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    return null;
  }
}

export async function generateMetadata({
  params,
}: MealPageProps): Promise<Metadata> {
  const { slug } = await params;
  const meal = await loadMeal(slug);

  if (!meal) {
    return buildPageMetadata({
      title: "Meal not found",
      description: "This meal is no longer on the JollofPlate menu.",
      path: `/menu/${slug}`,
      noIndex: true,
    });
  }

  const mealImage = meal.images?.find((src) => Boolean(src?.trim())) || null;
  const description =
    meal.description?.trim() ||
    `Order ${meal.name} from JollofPlate — delivery and pickup in Ikorodu, Lagos.`;

  return buildPageMetadata({
    title: meal.name,
    description,
    path: `/menu/${meal.slug}`,
    image: mealImage,
    imageAlt: mealImage
      ? `${meal.name} from JollofPlate`
      : undefined,
    keywords: [
      meal.name,
      meal.category?.name,
      "JollofPlate",
      "Ikorodu food delivery",
      "order jollof online",
    ].filter(Boolean) as string[],
  });
}

export default async function MealDetailPage({ params }: MealPageProps) {
  const { slug } = await params;
  const [meal, related] = await Promise.all([
    loadMeal(slug),
    getRelatedMeals(slug).catch(() => [] as Meal[]),
  ]);

  if (!meal) notFound();

  const price =
    typeof meal.discountPrice === "number" && meal.discountPrice < meal.price
      ? meal.discountPrice
      : meal.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: meal.name,
    description: meal.description || undefined,
    image: meal.images?.length
      ? meal.images.map((src) => absoluteAssetUrl(src))
      : undefined,
    category: meal.category?.name,
    url: new URL(`/menu/${meal.slug}`, SITE_URL).toString(),
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "NGN",
      availability: meal.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="border-b border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--secondary)_10%,var(--background))_0%,var(--background)_70%)]">
        <Container className="py-8 sm:py-12">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
          >
            <Link href="/menu" className="hover:text-primary">
              Menu
            </Link>
            {meal.category?.name ? (
              <>
                <ChevronRight className="size-3.5" />
                <Link
                  href={`/menu?category=${meal.category.slug}`}
                  className="hover:text-primary"
                >
                  {meal.category.name}
                </Link>
              </>
            ) : null}
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{meal.name}</span>
          </nav>

          <MealDetail meal={meal} />

          <RelatedMeals
            meals={related.filter((item) => item.slug !== meal.slug).slice(0, 4)}
          />
        </Container>
      </div>
    </>
  );
}
