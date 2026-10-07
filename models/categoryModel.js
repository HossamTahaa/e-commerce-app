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

// "phones.jpeg" -> "http://localhost:8000/categories/phones.jpeg" so the frontend can show it
const setImageURL = (doc) => {
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/categories/${doc.image}`;
  }
};

categorySchema.post("init", (doc) => setImageURL(doc)); // get all, get one, update
categorySchema.post("save", (doc) => setImageURL(doc)); // create

const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
