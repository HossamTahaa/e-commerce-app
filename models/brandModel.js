const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Brand require"],
      unique: [true, "Brand must be unique"],
      minLength: [3, "Too short Brand name"],
      maxLenth: [25, "Too long Brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    iamges: String,
  },

  { timestamps: true },
);


module.exports = mongoose.model("Brand", brandSchema);

