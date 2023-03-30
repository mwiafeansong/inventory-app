const express = require('express');
const categoryController = require('../controllers/categoryController');
const itemController = require('../controllers/itemController');
const stockController = require('../controllers/stockController');

const router = express.Router();

// ITEM ROUTES
router.get('/', itemController.index);

router.get('/item/create', itemController.item_create_get);

router.post('/item/create', itemController.item_create_post);

router.get('/item/:id/update', itemController.item_update_get);

router.post('/item/:id/update', itemController.item_update_post);

router.get('/item/:id/delete', itemController.item_delete_get);

router.post('/item/:id/delete', itemController.item_delete_post);

router.get('/item/:id', itemController.item_detail);

router.get('/items', itemController.item_list);

// CATEGORY ROUTES
router.get('/category/create', categoryController.category_create_get);

router.post('/category/create', categoryController.category_create_post);

router.get('/category/:id/update', categoryController.category_update_get);

router.post('/category/:id/update', categoryController.category_update_post);

router.get('/category/:id/delete', categoryController.category_delete_get);

router.post('/category/:id/delete', categoryController.category_delete_post);

router.get('/category/:id', categoryController.category_detail);

router.get('/categories', categoryController.category_list);

// STOCK ROUTES
router.get('/stock/create', stockController.stock_create_get);

router.post('/stock/create', stockController.stock_create_post);

router.get('/stock/:id/update', stockController.stock_update_get);

router.post('/stock/:id/update', stockController.stock_update_post);

router.get('/stock/:id/delete', stockController.stock_delete_get);

router.post('/stock/:id/delete', stockController.stock_delete_post);

router.get('/stock/:id', stockController.stock_detail);

router.get('/stocks', stockController.stock_list);

module.exports = router;
