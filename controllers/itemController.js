const Item = require('../models/item');
const Category = require('../models/category');
const Stock = require('../models/stock');
const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const utils = require('../utils');

exports.index = (req, res, next) => {
  async.parallel(
    {
      category_count(callback) {
        Category.countDocuments().exec(callback);
      },
      item_count(callback) {
        Item.countDocuments().exec(callback);
      },
      stock_count(callback) {
        Stock.countDocuments().exec(callback);
      },
    },
    (err, results) => {
      res.render('index', {
        styles: '/stylesheets/index.css',
        title: 'Inventory',
        error: err,
        data: results,
      });
    }
  );
};

exports.item_list = (req, res, next) => {
  Item.find()
    .populate({ path: 'category' })
    .exec(function (err, result) {
      if (err) return next(err);
      res.render('item_list', {
        styles: '/stylesheets/item_list.css',
        title: 'All Items',
        item_list: result,
      });
    });
};

exports.item_detail = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).exec(callback);
      },
      item_stock(callback) {
        Stock.find({ item: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      res.render('item_detail', {
        styles: '/stylesheets/item_detail.css',
        title: 'Item',
        item: results.item,
        item_stock: results.item_stock,
      });
    }
  );
};

exports.item_create_get = (req, res, next) => {
  Category.find().exec(function (err, result) {
    if (err) return next(err);
    res.render('item_form', {
      title: 'Create Item',
      categories: result,
    });
  });
};

exports.item_create_post = [
  body('item_name', 'Item name must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('item_description')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Item description must not be empty')
    .isLength({ max: 200 })
    .withMessage('Item description must not exceed 200 characters'),
  body('category', 'Invalid Category')
    .not()
    .matches(/Select Category/)
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    let item = new Item({
      name: utils.capitalizeWords(req.body.item_name),
      description: utils.capitalizeFirstWord(req.body.item_description),
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      Category.find().exec(function (err, result) {
        if (err) return next(err);

        res.render('item_form', {
          title: 'Create Item',
          item: item,
          categories: result,
          errors: errors.array(),
        });
      });
    } else {
      item.category = mongoose.Types.ObjectId(req.body.category);

      item.save(function (err) {
        if (err) return next(err);
        res.redirect(item.url);
      });
    }
  },
];

exports.item_delete_get = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).exec(callback);
      },
      item_stock(callback) {
        Stock.find({ item: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.item === null) res.redirect('/catalog/items');
      res.render('item_delete', {
        styles: '/stylesheets/item_detail.css',
        title: 'Delete Item',
        item: results.item,
        item_stock: results.item_stock,
      });
    }
  );
};

exports.item_delete_post = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.body.itemid).exec(callback);
      },
      item_stock(callback) {
        Stock.find({ item: req.body.itemid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);

      if (results.item_stock.length > 0) {
        res.render('item_delete', {
          styles: '/stylesheets/item_detail.css',
          title: 'Delete Item',
          item: results.item,
          item_stock: results.item_stock,
        });

        return;
      }

      Item.findByIdAndRemove(req.body.itemid, (err) => {
        if (err) return next(err);
        res.redirect('/catalog/items');
      });
    }
  );
};

exports.item_update_get = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).exec(callback);
      },
      categories(callback) {
        Category.find().exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);

      if (results.item === null) {
        const err = new Error('Item not found');
        err.status = 404;
        return next(err);
      }

      res.render('item_form', {
        title: 'Update Item',
        item: results.item,
        categories: results.categories,
      });
    }
  );
};

exports.item_update_post = [
  body('item_name', 'Item name must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('item_description')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Item description must not be empty')
    .isLength({ max: 200 })
    .withMessage('Item description must not exceed 200 characters'),
  body('category', 'Invalid Category')
    .not()
    .matches(/Select Category/)
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    let item = new Item({
      name: utils.capitalizeWords(req.body.item_name),
      description: utils.capitalizeFirstWord(req.body.item_description),
      category: req.body.category,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      Category.find().exec(function (err, result) {
        if (err) return next(err);

        res.render('item_form', {
          title: 'Update Item',
          item: item,
          categories: result,
          errors: errors.array(),
        });
      });
    } else {
      item.category = mongoose.Types.ObjectId(req.body.category);

      Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
        if (err) return next(err);
        res.redirect(theitem.url);
      });
    }
  },
];
