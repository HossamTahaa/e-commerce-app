const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

// generic CRUD handlers, the four services are the same five endpoints

exports.getAll = (Model, populationOpt) =>
  asyncHandler(async (req, res) => {
    // req.filterObj is set by nested routes (/categories/:categoryId/subcategories)
    const filter = req.filterObj || {};

    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .search(Model.modelName);

    // count the *same* conditions the query uses, otherwise numberOfPages lies
    const documentsCount = await Model.countDocuments(
      features.mongooseQuery.getFilter(),
    );

    features.sort().limitFields().paginate(documentsCount);

    let query = features.mongooseQuery;
    if (populationOpt) query = query.populate(populationOpt);

    const documents = await query;

    res.status(200).json({
      results: documents.length,
      paginationResult: features.paginationResult,
      data: documents,
    });
  });

exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    let query = Model.findById(id);
    if (populationOpt) query = query.populate(populationOpt);

    const document = await query;

    if (!document) {
      return next(new ApiError(`No ${Model.modelName} for this id ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);

    res.status(201).json({ data: document });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new ApiError(`No ${Model.modelName} for this id ${id}`, 404));
    }

    res.status(200).json({ data: document });
  });

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No ${Model.modelName} for this id ${id}`, 404));
    }

    res.status(204).send();
  });
