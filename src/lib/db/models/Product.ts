import mongoose, { Schema, Model } from "mongoose";

export interface IProductImage {
  fileId: string;
  url: string;
  filePath: string;
  sortOrder: number;
}

export interface IVariantOption {
  attributeId: string;
  name: string;
  slug: string;
  type: "select" | "color" | "text";
  value: string;
}

export interface IProductVariant {
  options: IVariantOption[];
  priceText: string;
}

export interface IProduct {
  name: string;
  slug: string;
  sku: string;
  category: mongoose.Types.ObjectId;
  priceText: string;
  minQty: number | null;
  description: string;
  sizes: string;
  fabric: string;
  color: string;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
  images: IProductImage[];
  videos: IProductImage[];
  variants: IProductVariant[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    fileId: {
      type: String,
      default: "",
    },

    url: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      default: "",
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const VariantOptionSchema = new Schema<IVariantOption>(
  {
    attributeId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["select", "color", "text"],
      default: "select",
    },

    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    options: {
      type: [VariantOptionSchema],
      default: [],
    },

    priceText: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    priceText: {
      type: String,
      required: true,
      trim: true,
    },

    minQty: {
      type: Number,
      default: null,
    },

    description: {
      type: String,
      default: "",
    },

    sizes: {
      type: String,
      default: "",
    },

    fabric: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    images: {
      type: [ProductImageSchema],
      default: [],
    },

    videos: {
      type: [ProductImageSchema],
      default: [],
    },

    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "products",
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ isFeatured: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;