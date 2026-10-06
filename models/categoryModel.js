const mongoose = require("mongoose");
const slugifyPlugin = require("../utils/slugifyPlugin");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [3, "Too short category name"],
      maxlength: [32, "Too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },

  { timestamps: true },
);

categorySchema.plugin(slugifyPlugin, { from: "name" });

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
