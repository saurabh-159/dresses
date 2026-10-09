import mongoose, { Schema, Model } from "mongoose";

export type AttributeType = "select" | "color" | "text";

export interface IAttribute {
  name: string;
  slug: string;
  type: AttributeType;
  values: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const AttributeSchema = new Schema<IAttribute>(
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

    type: {
      type: String,
      enum: ["select", "color", "text"],
      default: "select",
    },

    values: {
      type: [String],
      default: [],
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
    collection: "attributes",
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

const Attribute: Model<IAttribute> =
  mongoose.models.Attribute ||
  mongoose.model<IAttribute>("Attribute", AttributeSchema);

export default Attribute;
