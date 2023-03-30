const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StockSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  good_type: { type: String, maxLength: 100 },
  size: { type: String, maxLength: 100 },
  price: { type: Number, required: true },
  number_in_stock: { type: Number, required: true },
});

StockSchema.virtual('url').get(function () {
  return `/catalog/stock/${this._id}`;
});

module.exports = mongoose.model('Stock', StockSchema);
