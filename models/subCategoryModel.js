const mongoose = require("mongoose");
const slugifyPlugin = require("../utils/slugifyPlugin");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SubCategory name is required"],
      trim: true,
      unique: true,
      minlength: [2, "To short SubCategory name"],
      maxlength: [32, "Too long SubCategory name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    // it nescssary to take the parent category
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "subCategory must be belong to parent category"],
    },
  },
  { timestamps: true },
);

subCategorySchema.plugin(slugifyPlugin, { from: "name" });

module.exports = mongoose.model("SubCategory", subCategorySchema);
