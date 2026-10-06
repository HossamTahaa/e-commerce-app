const factory = require("./handlersFactory");
const Cupon = require("../models/cuponeModel")

exports.getCupon = factory.getAll(Cupon);

exports.getCupon = factory.getOne(Cupon);

exports.getCupon = factory.createOne(Cupon);

exports.getCupon = factory.updateOne(Cupon);

exports.deleteCupon = factory.deleteOne(Cupon);
