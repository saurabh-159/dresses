import mongoose from "mongoose";

import { connectDB } from "@/lib/db/mongoose";
import Category from "@/lib/db/models/Category";
import Product from "@/lib/db/models/Product";
import Slider from "@/lib/db/models/Slider";
import SiteSetting from "@/lib/db/models/SiteSetting";
import {
  searchWords,
  shouldSuggest,
  type SearchSuggestionCategory,
  type SearchSuggestionProduct,
  type SearchSuggestions,
} from "@/lib/search";

type LeanImage = {
  fileId?: string;
  url?: string;
  filePath?: string;
  sortOrder?: number;
};

type LeanProduct = {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  category?: mongoose.Types.ObjectId | { _id: mongoose.Types.ObjectId; name?: string; slug?: string; parent?: mongoose.Types.ObjectId | null };
  priceText: string;
  minQty?: number | null;
  description?: string;
  sizes?: string;
  fabric?: string;
  color?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  images?: LeanImage[];
  videos?: LeanImage[];
  variants?: {
    priceText?: string;
    options?: {
      attributeId?: string;
      name?: string;
      slug?: string;
      type?: string;
      value?: string;
    }[];
  }[];
  createdAt?: Date;
};

function optionType(value?: string): "select" | "color" | "text" {
  if (value === "color" || value === "text") {
    return value;
  }

  return "select";
}

function mapImages(images: LeanImage[] = []) {
  return [...images]
    .map((image) => ({
      fileId: image.fileId || "",
      url: image.url || "",
      filePath: image.filePath || "",
      sortOrder: image.sortOrder || 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function mapProduct(product: LeanProduct) {
  const category = product.category;
  const categoryId =
    category && typeof category === "object" && "_id" in category
      ? String(category._id)
      : category
        ? String(category)
        : "";

  const categoryName =
    category && typeof category === "object" && "name" in category
      ? category.name || ""
      : "";

  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryId,
    categoryName,
    priceText: product.priceText,
    minQty: product.minQty ?? 0,
    description: product.description || "",
    sizes: product.sizes || "",
    fabric: product.fabric || "",
    color: product.color || "",
    isFeatured: Boolean(product.isFeatured),
    sortOrder: product.sortOrder || 0,
    isActive: product.isActive !== false,
    images: mapImages(product.images),
    videos: mapImages(product.videos),
    variants: (product.variants || [])
      .filter((variant) => variant.priceText && variant.options?.length)
      .map((variant) => ({
        priceText: variant.priceText || "",
        options: (variant.options || []).map((option) => ({
          attributeId: option.attributeId || "",
          name: option.name || "",
          slug: option.slug || "",
          type: optionType(option.type),
          value: option.value || "",
        })),
      })),
  };
}

function pageNumber(value: number) {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

export async function getSiteSettings() {
  await connectDB();

  const settings = await SiteSetting.findOne({ key: "site" }).lean();

  if (!settings) {
    return null;
  }

  return {
    siteName: settings.siteName || "",
    tagline: settings.tagline || "",
    footerBlurb: settings.footerBlurb || "",
    aboutText: settings.aboutText || "",
    hours: settings.hours || "",
    address: settings.address || "",
    phone1: settings.phone1 || "",
    phone2: settings.phone2 || "",
    email: settings.email || "",
    whatsapp: settings.whatsapp || "",
    facebook: settings.facebook || "",
    instagram: settings.instagram || "",
    linkedin: settings.linkedin || "",
    logoUrl: settings.logoUrl || null,
    logoFileId: settings.logoFileId || "",
    logoPath: settings.logoPath || "",
  };
}

export async function getCategoryTree() {
  await connectDB();

  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  type CategoryNode = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
    children: CategoryNode[];
  };

  const nodes: CategoryNode[] = categories.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    parentId: category.parent ? String(category.parent) : null,
    imageUrl: category.imageUrl || null,
    videoUrl: category.videoUrl || null,
    children: [],
  }));

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots: typeof nodes = [];

  for (const node of nodes) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getHomeCategories() {
  await connectDB();

  const categories = await Category.find({
    isActive: true,
    showOnHome: true,
  })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const parentIds = categories
    .map((category) => category.parent)
    .filter((parent): parent is mongoose.Types.ObjectId => Boolean(parent));

  const [parents, children] = await Promise.all([
    parentIds.length
      ? Category.find({ _id: { $in: parentIds } })
          .select("name")
          .lean()
      : [],
    categories.length
      ? Category.find({
          parent: { $in: categories.map((category) => category._id) },
          isActive: true,
        })
          .select("_id parent")
          .lean()
      : [],
  ]);

  const parentNameById = new Map(
    parents.map((parent) => [String(parent._id), parent.name])
  );

  const countIds = [
    ...categories.map((category) => category._id),
    ...children.map((child) => child._id),
  ];

  const grouped = countIds.length
    ? await Product.aggregate<{ _id: mongoose.Types.ObjectId; total: number }>([
        {
          $match: {
            isActive: true,
            category: { $in: countIds },
          },
        },
        { $group: { _id: "$category", total: { $sum: 1 } } },
      ])
    : [];

  const countById = new Map(grouped.map((row) => [String(row._id), row.total]));

  return categories.map((category) => {
    const id = String(category._id);
    const childTotal = children
      .filter((child) => String(child.parent) === id)
      .reduce((sum, child) => sum + (countById.get(String(child._id)) || 0), 0);

    return {
      id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl || null,
      videoUrl: category.videoUrl || null,
      parentName: category.parent
        ? parentNameById.get(String(category.parent)) || null
        : null,
      itemCount: (countById.get(id) || 0) + childTotal,
    };
  });
}

export async function getActiveSliders() {
  await connectDB();

  const sliders = await Slider.find({ isActive: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  return sliders.map((slider) => ({
    id: String(slider._id),
    title: slider.title,
    url: slider.url || "",
    videoUrl: slider.videoUrl || "",
    linkUrl: slider.linkUrl || "",
    sortOrder: slider.sortOrder || 0,
  }));
}

export async function getFeaturedProducts(limit = 8) {
  await connectDB();

  const products = await Product.find({
    isActive: true,
    isFeatured: true,
  })
    .populate("category", "name slug")
    .sort({ sortOrder: 1, name: 1 })
    .limit(limit)
    .lean();

  return products.map((product) => mapProduct(product as LeanProduct));
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();

  const category = await Category.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!category) {
    return null;
  }

  let parent: { id: string; name: string; slug: string } | null = null;

  if (category.parent) {
    const parentCategory = await Category.findOne({
      _id: category.parent,
      isActive: true,
    })
      .select("name slug")
      .lean();

    if (parentCategory) {
      parent = {
        id: String(parentCategory._id),
        name: parentCategory.name,
        slug: parentCategory.slug,
      };
    }
  }

  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl || null,
    videoUrl: category.videoUrl || null,
    parent,
  };
}

async function itemCountsFor(categories: { _id: mongoose.Types.ObjectId }[]) {
  if (!categories.length) {
    return new Map<string, number>();
  }

  const children = await Category.find({
    parent: { $in: categories.map((category) => category._id) },
    isActive: true,
  })
    .select("_id parent")
    .lean();

  const countIds = [
    ...categories.map((category) => category._id),
    ...children.map((child) => child._id),
  ];

  const grouped = await Product.aggregate<{ _id: mongoose.Types.ObjectId; total: number }>([
    {
      $match: {
        isActive: true,
        category: { $in: countIds },
      },
    },
    { $group: { _id: "$category", total: { $sum: 1 } } },
  ]);

  const countById = new Map(grouped.map((row) => [String(row._id), row.total]));
  const totals = new Map<string, number>();

  for (const category of categories) {
    const id = String(category._id);
    const childTotal = children
      .filter((child) => String(child.parent) === id)
      .reduce((sum, child) => sum + (countById.get(String(child._id)) || 0), 0);

    totals.set(id, (countById.get(id) || 0) + childTotal);
  }

  return totals;
}

export async function getChildCategories(categoryId: string) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return [];
  }

  await connectDB();

  const children = await Category.find({
    parent: categoryId,
    isActive: true,
  })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const counts = await itemCountsFor(children);

  return children.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl || null,
    videoUrl: category.videoUrl || null,
    itemCount: counts.get(String(category._id)) || 0,
  }));
}

export async function getRelatedCategories(
  categoryId: string,
  parentId: string | null,
  limit = 8
) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return [];
  }

  await connectDB();

  const exclude = new mongoose.Types.ObjectId(categoryId);
  const siblingQuery =
    parentId && mongoose.Types.ObjectId.isValid(parentId)
      ? { isActive: true, parent: parentId, _id: { $ne: exclude } }
      : { isActive: true, parent: null, _id: { $ne: exclude } };

  let categories = await Category.find(siblingQuery)
    .sort({ sortOrder: 1, name: 1 })
    .limit(limit)
    .lean();

  if (categories.length < limit) {
    const more = await Category.find({
      isActive: true,
      _id: { $nin: [exclude, ...categories.map((category) => category._id)] },
    })
      .sort({ sortOrder: 1, name: 1 })
      .limit(limit - categories.length)
      .lean();

    categories = [...categories, ...more];
  }

  const parentIds = categories
    .map((category) => category.parent)
    .filter((parent): parent is mongoose.Types.ObjectId => Boolean(parent));

  const [parents, counts] = await Promise.all([
    parentIds.length
      ? Category.find({ _id: { $in: parentIds } })
          .select("name")
          .lean()
      : [],
    itemCountsFor(categories),
  ]);

  const parentNameById = new Map(
    parents.map((parent) => [String(parent._id), parent.name])
  );

  return categories.map((category) => ({
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    imageUrl: category.imageUrl || null,
    videoUrl: category.videoUrl || null,
    parentName: category.parent
      ? parentNameById.get(String(category.parent)) || null
      : null,
    itemCount: counts.get(String(category._id)) || 0,
  }));
}

async function categoryMatchIds(categoryId: string) {
  const children = await Category.find({
    parent: categoryId,
    isActive: true,
  })
    .select("_id")
    .lean();

  return [categoryId, ...children.map((child) => child._id)];
}

export async function getCategoryProductsPage(
  categoryId: string,
  requestedPage = 1,
  pageSize = 24
) {
  await connectDB();

  const page = pageNumber(requestedPage);
  const ids = mongoose.Types.ObjectId.isValid(categoryId)
    ? await categoryMatchIds(categoryId)
    : [];

  const filter = {
    isActive: true,
    category: { $in: ids },
  };

  const total = ids.length ? await Product.countDocuments(filter) : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const products = ids.length
    ? await Product.find(filter)
        .populate("category", "name slug")
        .sort({ sortOrder: 1, name: 1 })
        .skip((safePage - 1) * pageSize)
        .limit(pageSize)
        .lean()
    : [];

  return {
    products: products.map((product) => mapProduct(product as LeanProduct)),
    total,
    page: safePage,
    totalPages,
  };
}

export async function getShopProducts(requestedPage = 1, pageSize = 24) {
  await connectDB();

  const page = pageNumber(requestedPage);
  const filter = { isActive: true };
  const total = await Product.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const products = await Product.find(filter)
    .populate("category", "name slug")
    .sort({ sortOrder: 1, name: 1 })
    .skip((safePage - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return {
    products: products.map((product) => mapProduct(product as LeanProduct)),
    total,
    page: safePage,
    totalPages,
  };
}

export async function searchProducts(
  query: string,
  requestedPage = 1,
  pageSize = 24
) {
  await connectDB();

  const page = pageNumber(requestedPage);
  const term = query.trim();
  const filter: Record<string, unknown> = { isActive: true };

  if (term) {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { name: regex },
      { sku: regex },
      { description: regex },
      { color: regex },
      { fabric: regex },
      { sizes: regex },
    ];
  }

  const total = await Product.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const products = await Product.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .skip((safePage - 1) * pageSize)
    .limit(pageSize)
    .lean();

  return {
    products: products.map((product) => mapProduct(product as LeanProduct)),
    total,
    page: safePage,
    totalPages,
    query: term,
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function suggestionScore(value: string, phrase: string, words: string[]) {
  const name = value.trim().toLowerCase();
  if (!name) return 0;

  const query = phrase.toLowerCase();
  if (name === query) return 1000;
  if (name.startsWith(query)) return 800;
  if (name.includes(query)) return 600;

  let score = 0;
  for (const word of words) {
    const token = word.toLowerCase();
    if (token.length < 2) continue;
    if (name === token) score += 200;
    else if (name.startsWith(token)) score += 80;
    else if (name.includes(token)) score += 40;
  }

  return score;
}

export async function searchSuggestions(query: string): Promise<SearchSuggestions> {
  const term = query.trim().slice(0, 80);
  const words = searchWords(term);

  if (!shouldSuggest(term)) {
    return { query: term, categories: [], products: [] };
  }

  await connectDB();

  const phrase = new RegExp(escapeRegex(term), "i");
  const tokens = words
    .filter((word) => word.length >= 2)
    .map((word) => new RegExp(escapeRegex(word), "i"));
  const categoryMatch = [{ name: phrase }, ...tokens.map((token) => ({ name: token }))];
  const productMatch = [
    { name: phrase },
    { sku: phrase },
    { color: phrase },
    { fabric: phrase },
    ...tokens.flatMap((token) => [
      { name: token },
      { sku: token },
      { color: token },
      { fabric: token },
    ]),
  ];

  const [categoryDocs, productDocs] = await Promise.all([
    Category.find({ isActive: true, $or: categoryMatch })
      .populate("parent", "name")
      .select("name slug imageUrl parent")
      .limit(20)
      .lean(),
    Product.find({ isActive: true, $or: productMatch })
      .select("name slug priceText color fabric sku images")
      .limit(24)
      .lean(),
  ]);

  const categories: SearchSuggestionCategory[] = categoryDocs
    .map((category) => {
      const parent = category.parent;
      const parentName =
        parent &&
        typeof parent === "object" &&
        "name" in parent &&
        typeof parent.name === "string"
          ? parent.name
          : null;

      return {
        score: suggestionScore(category.name, term, words),
        item: {
          id: String(category._id),
          name: category.name,
          slug: category.slug,
          imageUrl: category.imageUrl || null,
          parentName,
        },
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, 5)
    .map((entry) => entry.item);

  const products: SearchSuggestionProduct[] = productDocs
    .map((product) => {
      const nameScore = suggestionScore(product.name, term, words);
      const detailScore = Math.max(
        suggestionScore(product.color || "", term, words),
        suggestionScore(product.fabric || "", term, words),
        suggestionScore(product.sku || "", term, words)
      );

      return {
        score: Math.max(nameScore, detailScore * 0.6),
        item: {
          id: String(product._id),
          name: product.name,
          slug: product.slug,
          priceText: product.priceText || "",
          imageUrl: product.images?.[0]?.url || null,
        },
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, 6)
    .map((entry) => entry.item);

  return { query: term, categories, products };
}

export async function getProductBySlug(slug: string) {
  await connectDB();

  const product = await Product.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!product) {
    return null;
  }

  const categoryDoc = product.category
    ? await Category.findOne({
        _id: product.category,
        isActive: true,
      }).lean()
    : null;

  let parent: { id: string; name: string; slug: string } | null = null;

  if (categoryDoc?.parent) {
    const parentCategory = await Category.findOne({
      _id: categoryDoc.parent,
      isActive: true,
    })
      .select("name slug")
      .lean();

    if (parentCategory) {
      parent = {
        id: String(parentCategory._id),
        name: parentCategory.name,
        slug: parentCategory.slug,
      };
    }
  }

  return {
    ...mapProduct(product as LeanProduct),
    category: categoryDoc
      ? {
          id: String(categoryDoc._id),
          name: categoryDoc.name,
          slug: categoryDoc.slug,
          parent,
        }
      : null,
  };
}

export async function getProductsByCategory(
  categoryId: string,
  limit = 24,
  excludeProductId?: string
) {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return [];
  }

  await connectDB();

  const filter: {
    category: string;
    isActive: boolean;
    _id?: { $ne: string };
  } = {
    category: categoryId,
    isActive: true,
  };

  if (excludeProductId && mongoose.Types.ObjectId.isValid(excludeProductId)) {
    filter._id = { $ne: excludeProductId };
  }

  const products = await Product.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .limit(limit)
    .lean();

  return products.map((product) => mapProduct(product as LeanProduct));
}

export async function getAdminDashboardStats() {
  await connectDB();

  const [categories, products, activeSliders, featuredProducts] =
    await Promise.all([
      Category.countDocuments(),
      Product.countDocuments(),
      Slider.countDocuments({ isActive: true }),
      Product.countDocuments({ isFeatured: true }),
    ]);

  return {
    categories,
    products,
    activeSliders,
    featuredProducts,
  };
}

export async function getRecentAdminProducts(limit = 8) {
  await connectDB();

  const products = await Product.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products.map((product) => {
    const category = product.category as
      | { _id?: mongoose.Types.ObjectId; name?: string; slug?: string }
      | mongoose.Types.ObjectId
      | null;

    const categoryName =
      category && typeof category === "object" && "name" in category
        ? category.name || ""
        : "";

    return {
      id: String(product._id),
      name: product.name,
      slug: product.slug,
      priceText: product.priceText,
      isFeatured: Boolean(product.isFeatured),
      category: categoryName ? { name: categoryName } : null,
    };
  });
}
