const mongoose = require('mongoose');
const slugifyPlugin = require('../utils/slugifyPlugin');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Too short product title'],
      maxlength: [100, 'Too long product title'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [20, 'Too short product description'],
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      trim: true,
      max: [20000, 'Too long product price'],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],

    imageCover: {
      type: String,
      required: [true, 'Product Image cover is required'],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product must be belong to category'],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'SubCategory',
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: 'Brand',
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above or equal 1.0'],
      max: [5, 'Rating must be below or equal 5.0'],
      // set: (val) => Math.round(val * 10) / 10, // 3.3333 * 10 => 33.333 => 33 => 3.3
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.plugin(slugifyPlugin, { from: 'title' });

// Mongoose query middleware: before every find, add the category name
// (normal function, not =>, so "this" is the query. Mongoose 9: no next())
productSchema.pre(/^find/, function () {
  this.populate({
    path: 'category',
    select: 'name -_id',
  });
});

// "product-xxx.jpeg" -> "http://localhost:8000/products/product-xxx.jpeg"
// values that are already a full link (the seed data) are left as they are
const toImageURL = (image) =>
  image.startsWith('http') ? image : `${process.env.BASE_URL}/products/${image}`;

const setImageURL = (doc) => {
  if (doc.imageCover) {
    doc.imageCover = toImageURL(doc.imageCover);
  }
  if (doc.images) {
    doc.images = doc.images.map((image) => toImageURL(image));
  }
};

productSchema.post('init', (doc) => setImageURL(doc)); // get all, get one, update
productSchema.post('save', (doc) => setImageURL(doc)); // create

module.exports = mongoose.model('Product', productSchema);
    // to enable virtual populate
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// );

// productSchema.virtual('reviews', {
//   ref: 'Review',
//   foreignField: 'product',
//   localField: '_id',
// });
