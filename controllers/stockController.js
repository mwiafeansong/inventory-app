const Stock = require('../models/stock');
const Item = require('../models/item');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const utils = require('../utils');
const async = require('async');

exports.stock_list = (req, res, next) => {
  Stock.find()
    .populate('item')
    .exec(function (err, result) {
      if (err) return next(err);
      res.render('stock_list', {
        styles: '/stylesheets/item_list.css',
        title: 'All Stock',
        stock_list: result,
      });
    });
};

exports.stock_detail = (req, res, next) => {
  res.send('Stock detail not implemented');
};

exports.stock_create_get = (req, res, next) => {
  Item.find()
    .sort({ name: 1 })
    .exec(function (err, result) {
      if (err) return next(err);

      res.render('stock_form', {
        title: 'Create Stock',
        items: result,
      });
    });
};

exports.stock_create_post = [
  body('item', 'Invalid Category')
    .not()
    .matches(/Select Item/)
    .escape(),
  body('stock_type', 'Type should not have blank spaces')
    .trim()
    .optional({ checkFalsy: true })
    .escape(),
  body('stock_size', 'Size should not have blank spaces')
    .trim()
    .optional({ checkFalsy: true })
    .escape(),
  body('price', 'Price should not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('number_in_stock', 'Number In Stock should not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    let stock = new Stock({
      item: req.body.item,
      good_type: req.body.stock_type,
      size: req.body.stock_size,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
    });

    if (!errors.isEmpty()) {
      Item.find()
        .sort({ name: 1 })
        .exec(function (err, result) {
          if (err) return next(err);

          res.render('stock_form', {
            title: 'Create Stock',
            items: result,
            stock,
            errors: errors.array(),
          });
        });
    } else {
      //convert the item id string to objectid to be saved
      stock.item = mongoose.Types.ObjectId(req.body.item);
      stock.good_type = utils.capitalizeWords(req.body.stock_type);
      stock.price = parseFloat(parseFloat(req.body.price).toFixed(2));
      stock.number_in_stock = parseInt(req.body.number_in_stock);

      stock.save((err) => {
        if (err) return next(err);

        //find the correspond item which stock belongs to so we can redirect to item page when done
        Item.findById(stock.item).exec((err, result) => {
          if (err) return next(err);
          res.redirect(result.url);
        });
      });
    }
  },
];

exports.stock_delete_get = (req, res, next) => {
  Stock.findById(req.params.id)
    .populate('item')
    .exec(function (err, result) {
      if (err) return next(err);
      if (result === null) res.redirect(result.item.url);
      res.render('stock_delete', {
        styles: '/stylesheets/item_detail.css',
        title: 'Delete Stock',
        stock: result,
      });
    });
};

exports.stock_delete_post = (req, res, next) => {
  Stock.findByIdAndRemove(req.body.stockid, (err) => {
    if (err) return next(err);
    res.redirect('/catalog/stocks');
  });
};

exports.stock_update_get = (req, res, next) => {
  async.parallel(
    {
      stock(callback) {
        Stock.findById(req.params.id).exec(callback);
      },
      items(callback) {
        Item.find().exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);

      if (results.stock === null) {
        const err = new Error('Stock not found');
        err.status = 404;
        return next(err);
      }

      res.render('stock_form', {
        title: 'Update Stock',
        stock: results.stock,
        items: results.items,
      });
    }
  );
};

exports.stock_update_post = [
  body('item', 'Invalid Category')
    .not()
    .matches(/Select Item/)
    .escape(),
  body('stock_type', 'Type should not have blank spaces')
    .trim()
    .optional({ checkFalsy: true })
    .escape(),
  body('stock_size', 'Size should not have blank spaces')
    .trim()
    .optional({ checkFalsy: true })
    .escape(),
  body('price', 'Price should not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('number_in_stock', 'Number In Stock should not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    let stock = new Stock({
      item: req.body.item,
      good_type: req.body.stock_type,
      size: req.body.stock_size,
      price: req.body.price,
      number_in_stock: req.body.number_in_stock,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Item.find()
        .sort({ name: 1 })
        .exec(function (err, result) {
          if (err) return next(err);

          res.render('stock_form', {
            title: 'Update Stock',
            items: result,
            stock,
            errors: errors.array(),
          });
        });
    } else {
      //convert the item id string to objectid to be saved
      stock.item = mongoose.Types.ObjectId(req.body.item);
      if (stock.good_type != null)
        stock.good_type = utils.capitalizeWords(req.body.stock_type);
      stock.price = parseFloat(parseFloat(req.body.price).toFixed(2));
      stock.number_in_stock = parseInt(req.body.number_in_stock);

      Stock.findByIdAndUpdate(req.params.id, stock)
        .populate('item')
        .exec(function (err, result) {
          if (err) return next(err);
          res.redirect(result.item.url);
        });
    }
  },
];
