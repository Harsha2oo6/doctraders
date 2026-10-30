import "server-only";
import { CategoryModel } from "../models";
import { publicCategory } from "../serializers";

export async function listActiveCategories() {
  const rows = await CategoryModel.find({ active: true }).sort({ order: 1, name: 1 }).lean();
  return rows.map(publicCategory);
}

export async function activeCategorySlugs(): Promise<Set<string>> {
  const rows = await CategoryModel.find({ active: true }, { slug: 1 }).lean();
  return new Set(rows.map((r) => r.slug));
}
