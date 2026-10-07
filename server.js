const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const dbConnection = require("./config/data.base");
const categoryRoute = require("./routes/categoryRoute");
const subCategoryRoute = require("./routes/subCategoryRoute");
const productRoute = require("./routes/productRoute");
const brandRoute = require("./routes/brandRoute");
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");

// __dirname keeps this working no matter which folder you run "node" from
dotenv.config({ path: path.join(__dirname, "config.env") });

if (!process.env.DB_URL) {
  console.error(
    "Missing DB_URL. Copy config.env.example to config.env and fill it in.",
  );
  process.exit(1);
}

const app = express();

// Express 5 reads ?price[gte]=50 as { "price[gte]": "50" }
// "extended" makes it { price: { gte: "50" } }
app.set("query parser", "extended");

dbConnection();
 
//middleware
app.use(express.json());
// make the uploads folder public
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
//Mount Routes
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/subcategories", subCategoryRoute);
app.use("/api/v1/brands", brandRoute);
app.use("/api/v1/products", productRoute);

//if the path worng
app.use((req, res, next) => {
  next(new ApiError(`Cant find this route: ${req.originalUrl}`, 404));
});

//glob error(take error form next) for express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`app running on http://localhost:${PORT}`);
});

//handle rejection outside the express
//law 3ndy promies hasl feh error bas mhdsh 3amlo catch
process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("shutting down");
    process.exit(1);
  });
});
