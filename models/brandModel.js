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

// "nike.jpeg" -> "http://localhost:8000/brands/nike.jpeg" so the frontend can show it
const setImageURL = (doc) => {
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/brands/${doc.image}`;
  }
};

brandSchema.post("init", (doc) => setImageURL(doc)); // get all, get one, update
brandSchema.post("save", (doc) => setImageURL(doc)); // create

module.exports = mongoose.model("Brand", brandSchema);
