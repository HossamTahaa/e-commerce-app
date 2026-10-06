const mongoose = require("mongoose");
const slugifyPlugin = require("../utils/slugifyPlugin");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
      unique: true,
      minlength: [3, "Too short Brand name"],
      maxlength: [32, "Too long Brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },

  { timestamps: true },
);

brandSchema.plugin(slugifyPlugin, { from: "name" });

module.exports = mongoose.model("Brand", brandSchema);
