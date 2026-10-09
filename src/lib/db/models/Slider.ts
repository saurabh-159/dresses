import mongoose, { Schema, Model } from "mongoose";

export interface ISlider {
  title: string;
  fileId: string | null;
  url: string | null;
  filePath: string | null;
  videoFileId: string | null;
  videoUrl: string | null;
  videoPath: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const SliderSchema = new Schema<ISlider>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    fileId: {
      type: String,
      default: null,
    },

    url: {
      type: String,
      default: null,
    },

    filePath: {
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

    linkUrl: {
      type: String,
      default: null,
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
    collection: "sliders",
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

const Slider: Model<ISlider> =
  mongoose.models.Slider ||
  mongoose.model<ISlider>("Slider", SliderSchema);

export default Slider;