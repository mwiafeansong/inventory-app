#! /usr/bin/env node

console.log(
  'This script populates some grocery items, category and stock to the specified mongoDB database'
);

const userArgs = process.argv.slice(2);

const async = require('async');
const Category = require('./models/category');
const Item = require('./models/item');
const Stock = require('./models/stock');
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const categories = [];
const items = [];
const stocks = [];

function categoryCreate(name, description, cb) {
  const category = new Category({ name: name, description: description });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category' + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(name, description, category, cb) {
  itemdetail = {
    name: name,
    description: description,
    category: category,
  };

  const item = new Item(itemdetail);

  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Item:' + item);
    items.push(item);
    cb(null, item);
  });
}

function stockCreate(item, good_type, size, price, number_in_stock, cb) {
  stockdetail = {
    item: item,
    size: size,
    price: price,
    number_in_stock: number_in_stock,
  };

  if (good_type !== false) stockdetail.good_type = good_type;

  const stock = new Stock(stockdetail);
  stock.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Stock:' + stock);
    stocks.push(stock);
    cb(null, stock);
  });
}

function createCategories(cb) {
  async.parallel(
    [
      function (callback) {
        categoryCreate(
          'Canned Goods',
          'Canned vegetables, fruits, fish and more',
          callback
        );
      },
      function (callback) {
        categoryCreate(
          'Packaged Goods',
          'Neatly packaged bread, biscuits, nuts and more',
          callback
        );
      },
      function (callback) {
        categoryCreate(
          'Drinks',
          'Water, alcoholic and non-alcoholic drinks and beverages',
          callback
        );
      },
    ],
    cb
  );
}

function createItems(cb) {
  async.series(
    [
      function (callback) {
        itemCreate(
          'Canned Tomatoes',
          'Tomatoes in a can',
          categories[0],
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Canned Tuna Fish',
          'Tuna Fish in a can',
          categories[0],
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Canned Baked Beans',
          'Baked beans goodness',
          categories[0],
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Canned Green Beans',
          'Green beans in a can',
          categories[0],
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Bread (Loaf)',
          'Freshly baked bread',
          categories[1],
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Crackers',
          'Taste some cruchy goodness',
          categories[1],
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Popcorn',
          'Sweetened, salted, whatever you want',
          categories[1],
          callback
        );
      },
      function (callback) {
        itemCreate('Pasta', 'Italian pasta', categories[1], callback);
      },
      function (callback) {
        itemCreate('Cornflakes', 'Made with corn', categories[1], callback);
      },
      function (callback) {
        itemCreate('Water', 'Bottled in a 12 pack', categories[2], callback);
      },
      function (callback) {
        itemCreate(
          'Orange Juice',
          'Packaged in juice box',
          categories[2],
          callback
        );
      },
      function (callback) {
        itemCreate(
          'Tea bag',
          'Multiple packaged in box',
          categories[2],
          callback
        );
      },
    ],
    cb
  );
}

function createStock(cb) {
  async.parallel(
    [
      function (callback) {
        stockCreate(items[0], false, 'Large', 2.99, 5, callback);
      },
      function (callback) {
        stockCreate(items[0], false, 'Small', 0.75, 10, callback);
      },
      function (callback) {
        stockCreate(items[1], false, 'Small', 0.55, 12, callback);
      },
      function (callback) {
        stockCreate(items[2], false, 'Small', 1.25, 17, callback);
      },
      function (callback) {
        stockCreate(items[3], false, 'Small', 1.55, 20, callback);
      },
      function (callback) {
        stockCreate(items[4], 'Butter', 'Small', 1.55, 25, callback);
      },
      function (callback) {
        stockCreate(items[4], 'Wheat', 'Small', 1.55, 20, callback);
      },
      function (callback) {
        stockCreate(items[5], false, 'Small', 1.55, 30, callback);
      },
      function (callback) {
        stockCreate(items[6], 'salted', 'Small', 1.55, 28, callback);
      },
      function (callback) {
        stockCreate(items[7], false, 'Small', 1.55, 5, callback);
      },
      function (callback) {
        stockCreate(items[8], false, 'Small', 1.55, 9, callback);
      },
      function (callback) {
        stockCreate(items[9], 'Sparkling', 'Large', 2.99, 10, callback);
      },
      function (callback) {
        stockCreate(items[9], 'Mineral', 'Medium', 1.99, 30, callback);
      },
      function (callback) {
        stockCreate(items[10], false, 'Large', 2.99, 12, callback);
      },
      function (callback) {
        stockCreate(items[11], false, 'Large', 2.99, 6, callback);
      },
    ],
    cb
  );
}

async.series(
  [createCategories, createItems, createStock],

  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err);
    } else {
      console.log('Stocks: ' + stocks);
    }

    mongoose.connection.close();
  }
);
