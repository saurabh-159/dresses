import mongoose, { Schema, Model } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  parent: mongoose.Types.ObjectId | null;
  imageFileId: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  videoFileId: string | null;
  videoUrl: string | null;
  videoPath: string | null;
  showOnHome: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>(
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

    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    imageFileId: {
      type: String,
      default: null,
    },

    imageUrl: {
      type: String,
      default: null,
    },

    imagePath: {
      type: String,
      default: null,
    },

    videoFileId: {
      type: String,
      default: null,
    },

    videoUrl: {
      type: String,
      default: null,
    },

    videoPath: {
      type: String,
      default: null,
    },

    showOnHome: {
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
  },
  {
    timestamps: true,
    collection: "categories",
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

CategorySchema.index({ parent: 1 });
CategorySchema.index({ showOnHome: 1, isActive: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);

export default Category;