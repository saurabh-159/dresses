import mongoose, { Schema, Model } from "mongoose";

export interface ISiteSetting {
  key: string;
  siteName: string;
  tagline: string;
  footerBlurb: string;
  aboutText: string;
  hours: string;
  address: string;
  phone1: string;
  phone2: string;
  email: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  logoFileId: string | null;
  logoUrl: string | null;
  logoPath: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "site",
    },

    siteName: {
      type: String,
      default: "Dresses",
    },

    tagline: {
      type: String,
      default: "",
    },

    footerBlurb: {
      type: String,
      default: "",
    },

    aboutText: {
      type: String,
      default: "",
    },

    hours: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    phone1: {
      type: String,
      default: "",
    },

    phone2: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    whatsapp: {
      type: String,
      default: "",
    },

    facebook: {
      type: String,
      default: "",
    },

    instagram: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    logoFileId: {
      type: String,
      default: null,
    },

    logoUrl: {
      type: String,
      default: null,
    },

    logoPath: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "sitesettings",
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

const SiteSetting: Model<ISiteSetting> =
  mongoose.models.SiteSetting ||
  mongoose.model<ISiteSetting>("SiteSetting", SiteSettingSchema);

export default SiteSetting;