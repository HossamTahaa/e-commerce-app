const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const dbConnection = require("./config/data.base");
const categoryRoute = require("./routes/categoryRoute");
const subCategoryRoute = require ('./routes/subCategoryRoute');
const brandyRoute = require ('./routes/brandRoute')
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");

dotenv.config({ path: "config.env" });


const app = express();

dbConnection();

//middleware
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}
//Mount Routes
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/subCategory", subCategoryRoute);
app.use("/api/v1/brand", brandyRoute);
 
//if the path worng
app.use((req, res, next) => {
  next(new ApiError(`Cant find this route: ${req.originalUrl}`, 404));
});

//glob error(take error form next) for express
app.use(globalError);

 const PORT = process.env.PORT || 8000;
 const server = app.listen(PORT, () => {
  console.log("app run");
});

//handle rejectiono utside the express
//law 3ndy promies hasl feh error bas mhdsh 3amlo catch
process.on('unhandledRejection',(err)=> {
   console.log(`unhandledRejection Error: ${err.name} | ${err.message}`);
   server.close(()=> {
    console.error("shutting down");
    process.exit(1)
   })
})
