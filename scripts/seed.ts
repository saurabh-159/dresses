import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "../src/lib/db/mongoose";
import AdminUser from "../src/lib/db/models/AdminUser";
import Category from "../src/lib/db/models/Category";
import Product from "../src/lib/db/models/Product";
import Slider from "../src/lib/db/models/Slider";
import SiteSetting from "../src/lib/db/models/SiteSetting";
import { defaultSettings } from "../src/lib/site";

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("MongoDB connected.");

    const email = process.env.ADMIN_EMAIL || "admin@dresses.com";
    const password = process.env.ADMIN_PASSWORD || "Dresses@123";
    const passwordHash = await bcrypt.hash(password, 10);

    await AdminUser.findOneAndUpdate(
      { email },
      {
        $set: {
          name: "Store Admin",
          email,
          passwordHash,
        },
      },
      { upsert: true, new: true }
    );

    console.log("Admin user ready");

    const parents = [
      { name: "Dresses", slug: "dresses", showOnHome: true, sortOrder: 1 },
      { name: "Kurtis", slug: "kurtis", showOnHome: true, sortOrder: 2 },
      { name: "Sarees", slug: "sarees", showOnHome: true, sortOrder: 3 },
      { name: "Co-ords", slug: "co-ords", showOnHome: true, sortOrder: 4 },
    ];

    for (const item of parents) {
      await Category.findOneAndUpdate(
        { slug: item.slug },
        {
          $set: { ...item, parent: null, isActive: true },
          $setOnInsert: { imageFileId: null, imageUrl: null, imagePath: null },
        },
        { upsert: true, new: true }
      );
    }

    const dresses = await Category.findOne({ slug: "dresses" });
    const kurtis = await Category.findOne({ slug: "kurtis" });
    const sarees = await Category.findOne({ slug: "sarees" });

    if (!dresses || !kurtis || !sarees) {
      throw new Error("Parent categories were not created");
    }

    const children = [
      { name: "Party Dresses", slug: "party-dresses", parent: dresses._id, sortOrder: 1 },
      { name: "Casual Dresses", slug: "casual-dresses", parent: dresses._id, sortOrder: 2 },
      { name: "Cotton Kurtis", slug: "cotton-kurtis", parent: kurtis._id, sortOrder: 1 },
      { name: "Festive Kurtis", slug: "festive-kurtis", parent: kurtis._id, sortOrder: 2 },
      { name: "Silk Sarees", slug: "silk-sarees", parent: sarees._id, sortOrder: 1 },
      { name: "Cotton Sarees", slug: "cotton-sarees", parent: sarees._id, sortOrder: 2 },
    ];

    for (const item of children) {
      await Category.findOneAndUpdate(
        { slug: item.slug },
        {
          $set: { ...item, showOnHome: false, isActive: true },
          $setOnInsert: { imageFileId: null, imageUrl: null, imagePath: null },
        },
        { upsert: true, new: true }
      );
    }

    const allCategories = await Category.find({});
    const categoryMap = new Map(allCategories.map((category) => [category.slug, category._id]));

    const products = [
      {
        name: "Black Midi Dress",
        slug: "black-midi-dress",
        sku: "DRS-101",
        categorySlug: "party-dresses",
        priceText: "₹2,499",
        sizes: "S, M, L, XL",
        fabric: "Georgette",
        color: "Black",
        description: "Sleeveless midi dress with a lined bodice.",
        isFeatured: true,
      },
      {
        name: "Floral Day Dress",
        slug: "floral-day-dress",
        sku: "DRS-102",
        categorySlug: "casual-dresses",
        priceText: "₹1,899",
        sizes: "XS, S, M, L",
        fabric: "Cotton",
        color: "Yellow print",
        description: "Knee-length dress for daytime wear.",
        isFeatured: true,
      },
      {
        name: "White Cotton Kurti",
        slug: "white-cotton-kurti",
        sku: "KUR-201",
        categorySlug: "cotton-kurtis",
        priceText: "₹1,299",
        sizes: "S, M, L, XL, XXL",
        fabric: "Cotton",
        color: "White",
        description: "Straight kurti with side slits.",
        isFeatured: true,
      },
      {
        name: "Maroon Festive Kurti",
        slug: "maroon-festive-kurti",
        sku: "KUR-202",
        categorySlug: "festive-kurtis",
        priceText: "₹1,799",
        sizes: "M, L, XL",
        fabric: "Rayon",
        color: "Maroon",
        description: "Embroidered neckline, full sleeves.",
        isFeatured: false,
      },
      {
        name: "Banarasi Silk Saree",
        slug: "banarasi-silk-saree",
        sku: "SAR-301",
        categorySlug: "silk-sarees",
        priceText: "₹4,500",
        sizes: "Free size, 5.5 m",
        fabric: "Silk",
        color: "Red and gold",
        description: "Includes an unstitched blouse piece.",
        isFeatured: true,
      },
      {
        name: "Handloom Cotton Saree",
        slug: "handloom-cotton-saree",
        sku: "SAR-302",
        categorySlug: "cotton-sarees",
        priceText: "₹2,200",
        sizes: "Free size, 5.5 m",
        fabric: "Cotton",
        color: "Indigo",
        description: "Lightweight saree for daily wear.",
        isFeatured: false,
      },
      {
        name: "Olive Co-ord Set",
        slug: "olive-co-ord-set",
        sku: "CRD-401",
        categorySlug: "co-ords",
        priceText: "₹2,799",
        sizes: "S, M, L",
        fabric: "Linen blend",
        color: "Olive",
        description: "Shirt and wide-leg trouser set.",
        isFeatured: true,
      },
    ];

    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      const categoryId = categoryMap.get(product.categorySlug);

      if (!categoryId) {
        throw new Error(`Category not found: ${product.categorySlug}`);
      }

      await Product.findOneAndUpdate(
        { slug: product.slug },
        {
          $set: {
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            category: categoryId,
            priceText: product.priceText,
            minQty: 1,
            description: product.description,
            sizes: product.sizes,
            fabric: product.fabric,
            color: product.color,
            isFeatured: product.isFeatured,
            sortOrder: index + 1,
            isActive: true,
          },
          $setOnInsert: { images: [] },
        },
        { upsert: true, new: true }
      );
    }

    const sliderCount = await Slider.countDocuments();

    if (sliderCount === 0) {
      await Slider.insertMany([
        {
          title: "New season dresses",
          fileId: null,
          url: null,
          filePath: null,
          linkUrl: "/category/dresses",
          sortOrder: 1,
          isActive: true,
        },
        {
          title: "Kurtis for everyday",
          fileId: null,
          url: null,
          filePath: null,
          linkUrl: "/category/kurtis",
          sortOrder: 2,
          isActive: true,
        },
      ]);
    }

    await SiteSetting.findOneAndUpdate(
      { key: "site" },
      {
        $set: {
          key: "site",
          siteName: defaultSettings.siteName,
          tagline: defaultSettings.tagline,
          footerBlurb: defaultSettings.footerBlurb,
          aboutText: defaultSettings.aboutText,
          hours: defaultSettings.hours,
          address: defaultSettings.address,
          phone1: "",
          phone2: "",
          email: "",
          whatsapp: "",
          facebook: "",
          instagram: "",
          linkedin: "",
        },
        $setOnInsert: {
          logoFileId: null,
          logoUrl: null,
          logoPath: null,
        },
      },
      { upsert: true, new: true }
    );

    console.log("Clothing catalog seeded");
    console.log(`Admin email: ${email}`);
    console.log(`Admin password: ${password}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:");
    console.error(error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seed();
