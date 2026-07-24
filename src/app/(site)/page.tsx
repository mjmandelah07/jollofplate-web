import type { Metadata } from "next";
import { CategoriesSection } from "@/components/home/categories-section";
import { FinalCtaSection } from "@/components/home/final-cta-section";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { MealGridSection } from "@/components/home/meal-grid-section";
import { ServicesSection } from "@/components/home/services-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import {
  getBestSellerMeals,
  getCategories,
  getFeaturedMeals,
} from "@/lib/api/catalog";
import { getSettings } from "@/lib/api/settings";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "JollofPlate | Every Plate Tells a Story",
    description:
      "Order authentic Nigerian jollof, groceries, and catering from Ikorodu, Lagos. Delivery and pickup available with easy WhatsApp checkout.",
    path: "/",
  }),
  title: {
    absolute: "JollofPlate | Every Plate Tells a Story",
  },
};

const heroSlides = [
  {
    src: "/hero/signature-jollof-hero.png",
    alt: "Plate of smoky Nigerian party jollof rice with plantain and chicken",
    headline: "Every Plate Tells a Story.",
    support: "Fresh. Hot. Authentic. Premium jollof made to order.",
  },
  {
    src: "/hero/community-feel.png",
    alt: "A generous Nigerian jollof feast spread for sharing",
    headline: "Made for sharing.",
    support: "Family tables, office lunches, and celebration trays.",
  },
  {
    src: "/hero/foodstuff.png",
    alt: "Nigerian grocery essentials including rice, oil, and tinned tomatoes",
    headline: "Stock your kitchen with us.",
    support: "Rice, oils, Maggi, tinned tomatoes, and everyday foodstuff.",
  },
  {
    src: "/hero/pantry-shelf.png",
    alt: "A well-stocked pantry shelf filled with Nigerian grocery essentials",
    headline: "Everything your pantry needs.",
    support: "Shop trusted staples for everyday meals, all in one place.",
  },
  {
    src: "/hero/frozen-food.png",
    alt: "Fresh and frozen chicken and fish on ice",
    headline: "Frozen foods, ready when you are.",
    support: "Quality chicken, fish, and proteins for home cooking.",
  },
  {
    src: "/hero/lifestyle.png",
    alt: "Hands serving a steaming plate of jollof rice",
    headline: "Served hot. Ordered easy.",
    support: "Browse the menu and checkout on WhatsApp in minutes.",
  },
];

async function loadHomeData() {
  const [settings, categories, featured, bestSellers] = await Promise.all([
    getSettings().catch(() => null),
    getCategories().catch(() => []),
    getFeaturedMeals().catch(() => []),
    getBestSellerMeals().catch(() => []),
  ]);

  return { settings, categories, featured, bestSellers };
}

export default async function HomePage() {
  const { settings, categories, featured, bestSellers } = await loadHomeData();

  const email =
    settings?.email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || undefined;
  const phone =
    settings?.whatsappNumber ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    undefined;
  const address =
    settings?.address ||
    process.env.NEXT_PUBLIC_ADDRESS ||
    "Ikorodu, Lagos, Nigeria";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: settings?.restaurantName || "JollofPlate",
    description:
      "Authentic Nigerian jollof meals, groceries, catering, and corporate lunch from Ikorodu, Lagos. Delivery and pickup with WhatsApp checkout.",
    url: siteUrl,
    image: `${siteUrl}/hero/signature-jollof-hero.png`,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Ikorodu",
      addressRegion: "Lagos",
      addressCountry: "NG",
    },
    areaServed: {
      "@type": "City",
      name: "Ikorodu",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Delivery and pickup",
    },
    servesCuisine: ["Nigerian", "African", "Jollof"],
    priceRange: "₦₦",
    sameAs: settings?.socialLinks?.instagram
      ? [settings.socialLinks.instagram]
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroCarousel slides={heroSlides} />
      <ServicesSection />
      <CategoriesSection categories={categories} />
      <MealGridSection
        title="Featured on the menu"
        description="Hand-picked plates worth ordering today."
        meals={featured}
        emptyMessage="Featured meals are cooking — browse the full menu meanwhile."
      />
      <MealGridSection
        title="Top sellers"
        description="What customers keep coming back for."
        meals={bestSellers}
        emptyMessage="Top sellers will show here once orders start rolling in."
      />
      <HowItWorksSection />
      <TestimonialsSection />
      <FinalCtaSection
        whatsappNumber={
          settings?.whatsappNumber ||
          process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
          undefined
        }
      />
    </>
  );
}
