// turn ( ) . * + ? into normal text, so the user can't break the $regex
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

class ApiFeatures {
  // runs once with "new": save the 2 things every method needs
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery; // the search we build for MongoDB
    this.queryString = queryString; // req.query - what the user asked for
  }

  // Filter: ?price[gte]=50  ->  { price: { $gte: "50" } }
  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields", "keyword"];
    excludeFields.forEach((field) => delete queryObj[field]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
    return this;
  }

  // Search: ?keyword=gold
  // Product  -> title OR description contains "gold"
  // others   -> name contains "gold" (categories, subcategories, brands)
  search(modelName) {
    if (this.queryString.keyword) {
      const keyword = escapeRegex(this.queryString.keyword);
      let query = {};
      if (modelName === "Product") {
        query.$or = [
          { title: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ];
      } else {
        query = { name: { $regex: keyword, $options: "i" } };
      }

      this.mongooseQuery = this.mongooseQuery.find(query);
    }
    return this;
  }

  // Sort: ?sort=-price,title  ->  "-price title"
  sort() {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(",").join(" ")
      : "-createdAt";

    this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    return this;
  }

  // Fields: ?fields=title,price  ->  "title price"
  limitFields() {
    const fields = this.queryString.fields
      ? this.queryString.fields.split(",").join(" ")
      : "-__v";

    this.mongooseQuery = this.mongooseQuery.select(fields);
    return this;
  }

  // Pagination: ?page=2&limit=5  ->  skip 5, take 5
  // countDocuments = how many documents match (needed for numberOfPages)
  paginate(countDocuments) {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 5;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;

    // Pagination result
    const pagination = {};
    pagination.currentPage = page;
    pagination.limit = limit;
    pagination.numberOfPages = Math.ceil(countDocuments / limit);

    if (endIndex < countDocuments) pagination.next = page + 1; // there is a next page
    if (skip > 0) pagination.prev = page - 1; // there is a previous page

    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    this.paginationResult = pagination; // saved so the service can send it
    return this;
  }
}

module.exports = ApiFeatures;
