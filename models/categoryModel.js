const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Category require"],
      unique: [true, "Category must be unique"],
      minLength: [3, "Too short category name"],
      maxLenth: [25, "Too long category name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    iamges: String,
  },

  { timestamps: true },
);

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
