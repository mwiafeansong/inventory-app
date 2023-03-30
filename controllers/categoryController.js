const async = require('async');
const { body, validationResult } = require('express-validator');
const Category = require('../models/category');
const Item = require('../models/item');
const utils = require('../utils');

exports.category_list = (req, res, next) => {
  Category.find()
    .sort({ name: 1 })
    .exec(function (err, result) {
      if (err) return next(err);
      res.render('category_list', {
        styles: '/stylesheets/category_list.css',
        title: 'All Categories',
        category_list: result,
      });
    });
};

exports.category_detail = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.params.id }).sort({ name: 1 }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      res.render('category_detail', {
        styles: '/stylesheets/item_list.css',
        title: 'Category',
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

exports.category_create_get = (req, res, next) => {
  res.render('category_form', {
    // styles: '/stylesheets/author_form.css',
    title: 'Create Category',
  });
};

exports.category_create_post = [
  body('category_name', 'Category name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('category_description')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Description must not be empty.')
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  (req, res, next) => {
    const errors = validationResult(req);

    let category = new Category({
      name: utils.capitalizeWords(req.body.category_name),
      description: utils.capitalizeWords(req.body.category_description),
    });

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'Create Category',
        category,
        errors: errors.array(),
      });
    } else {
      Category.findOne({ name: category.name }).exec((err, result) => {
        if (err) return next(err);

        if (result) {
          res.redirect(result.url);
        } else {
          category.save(function (err) {
            if (err) return next(err);
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

exports.category_delete_get = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.params.id }).sort({ name: 1 }).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.category === null) res.redirect('/catalog/categories');
      res.render('category_delete', {
        styles: '/stylesheets/item_list.css',
        title: 'Delete Category',
        category: results.category,
        category_items: results.category_items,
      });
    }
  );
};

exports.category_delete_post = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.body.categoryid).exec(callback);
      },
      category_items(callback) {
        Item.find({ category: req.body.categoryid })
          .sort({ name: 1 })
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);

      if (results.category_items.length > 0) {
        res.render('category_delete', {
          styles: '/stylesheets/item_list.css',
          title: 'Delete Category',
          category: results.category,
          category_items: results.category_items,
        });
        return;
      }

      Category.findByIdAndRemove(req.body.categoryid, (err) => {
        if (err) return next(err);
        res.redirect('/catalog/categories');
      });
    }
  );
};

exports.category_update_get = (req, res, next) => {
  Category.findById(req.params.id, (err, result) => {
    if (err) return next(err);

    if (result === null) {
      const err = new Error('Category not found');
      err.status = 404;
      return next(err);
    }

    res.render('category_form', {
      title: 'Update Category',
      category: result,
    });
  });
};

exports.category_update_post = [
  body('category_name', 'Category name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('category_description')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Description must not be empty.')
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  (req, res, next) => {
    const errors = validationResult(req);

    let category = new Category({
      name: utils.capitalizeWords(req.body.category_name),
      description: utils.capitalizeWords(req.body.category_description),
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('category_form', {
        title: 'Update Category',
        category,
        errors: errors.array(),
      });
    } else {
      Category.findByIdAndUpdate(
        req.params.id,
        category,
        {},
        (err, thecategory) => {
          if (err) return next(err);
          res.redirect(thecategory.url);
        }
      );
    }
  },
];
