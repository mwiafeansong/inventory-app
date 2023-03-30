const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, maxLength: 100, required: true },
  description: { type: String, maxLength: 200, required: true },
});

CategorySchema.virtual('url').get(function () {
  return `/catalog/category/${this._id}`;
});

module.exports = mongoose.model('Category', CategorySchema);
