const fs = require("fs");
require("colors");
const path = require("path");
const dotenv = require("dotenv");

// __dirname = this folder, so it works no matter where you run the command from
dotenv.config({ path: path.join(__dirname, "../../config.env") });

const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");
const Brand = require("../../models/brandModel");
const Product = require("../../models/productModel");
const dbConnection = require("../../config/data.base");

// connect to DB
dbConnection();

// Read data
const readJSON = (file) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf-8"));

const categories = readJSON("categories.json");
const subCategories = readJSON("subcategories.json");
const brands = readJSON("brands.json");
const products = readJSON("product.json");

// only the ids that came from the json files, so -d never touches your own data
const idsOf = (docs) => docs.map((doc) => doc._id);
const categoryIds = idsOf(categories);

// Insert data into DB
// order matters: parents first (category) then the things that point to them
const insertData = async () => {
  try {
    await Category.create(categories);
    await SubCategory.create(subCategories);
    await Brand.create(brands);
    await Product.create(products);
    console.log("Data Inserted".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
    console.log("Tip: run  npm run seed:destroy  first, then seed again".yellow);
    process.exit(1);
  }
};

// Delete data from DB
// children first (products) then the parents
const destroyData = async () => {
  try {
    await Product.deleteMany({ category: { $in: categoryIds } });
    await Brand.deleteMany({ _id: { $in: idsOf(brands) } });
    await SubCategory.deleteMany({ _id: { $in: idsOf(subCategories) } });
    await Category.deleteMany({ _id: { $in: categoryIds } });
    console.log("Data Destroyed".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// node seeder.js -i  -> insert
// node seeder.js -d  -> delete
if (process.argv[2] === "-i") {
  insertData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
