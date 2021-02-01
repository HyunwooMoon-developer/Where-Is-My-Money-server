/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const path = require("path");
const xss = require("xss");
const express = require("express");
const SpendingItemService = require("./spending-item-service");
const { requireAuth } = require("../middleware/jwt-auth");

const spendingItemRouter = express.Router();
const jsonParser = express.json();

const serializeedItem = (item) => ({
  id: item.id,
  category_id: item.category_id,
  item_name: xss(item.item_name),
  spending: item.spending,
  content: xss(item.content),
  date_created: item.date_created,
});

spendingItemRouter
  .route("/")
  .get((req, res, next) => {
    const db = req.app.get("db");

    SpendingItemService.getAllSpendingItem(db)
      .then((items) => {
        res.json(items.map(serializeedItem));
      })
      .catch(next);
  })
  //.post(requireAuth,jsonParser, (req, res, next) =>{

  .post(requireAuth, jsonParser, (req, res, next) => {
    const { category_id, item_name, spending, content } = req.body;
    const newItems = { category_id, item_name, spending, content };
    const db = req.app.get("db");

    for (const [key, value] of Object.entries(newItems))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });

    SpendingItemService.insertSpendingItem(db, newItems)
      .then((item) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          .json(serializeedItem(item));
      })
      .catch(next);
  });

spendingItemRouter
  .route("/:sitem_id")
  .all(requireAuth)
  .all((req, res, next) => {
    const db = req.app.get("db");

    SpendingItemService.getSpendingItemById(db, req.params.sitem_id)
      .then((item) => {
        if (!item) {
          return res.status(404).json({
            error: { message: `Item doesn't exist` },
          });
        }
        res.item = item;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeedItem(res.item));
  })
  .delete((req, res, next) => {
    const db = req.app.get("db");

    SpendingItemService.deleteSpendingItem(db, req.params.sitem_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const db = req.app.get("db");
    const { category_id, item_name, spending, content } = req.body;
    const ItemToUpdate = { category_id, item_name, spending, content };

    const numberOfValues = Object.values(ItemToUpdate).filter(Boolean).length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          messge: `Request body must contain either 'category_id', 'item_name', 'spending' or 'content'`,
        },
      });
    SpendingItemService.updateSpendingItem(
      db,
      req.params.sitem_id,
      ItemToUpdate
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = spendingItemRouter;
