export type MealExtra = {
  name: string;
  price: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  mealCount?: number;
  _count?: {
    meals?: number;
  };
};

export type CategoryInput = {
  name: string;
  description?: string | null;
  image?: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export function getCategoryMealCount(category: Category) {
  return category.mealCount ?? category._count?.meals ?? 0;
}

export type Meal = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  categoryId: string;
  images: string[];
  preparationTime: number;
  featured: boolean;
  bestSeller: boolean;
  available: boolean;
  ingredients: string | null;
  extras: MealExtra[] | null;
  createdAt: string;
  updatedAt: string;
  category?: Pick<Category, "id" | "name" | "slug">;
};

export type MealInput = {
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  categoryId: string;
  images: string[];
  preparationTime: number;
  featured: boolean;
  bestSeller: boolean;
  available: boolean;
  ingredients?: string | null;
  extras?: MealExtra[] | null;
};
