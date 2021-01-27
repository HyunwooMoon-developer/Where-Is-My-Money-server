/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const path = require('path');
const express = require('express');
const xss = require('xss');
const SpendingListService = require('./spending-list-service');
const { requireAuth } = require('../middleware/jwt-auth');

const spendingListRouter = express.Router();
const jsonParser = express.json();

const serializedList = list => ({
    id : list.id,
    category: xss(list.category),
    user_id : list.user_id,
})

spendingListRouter
.route('/')
.get((req, res, next)=> {
    const db= req.app.get('db')
    
    SpendingListService.getAllSpendingList(db)
                        .then(lists=> {
                            res.json(lists.map(serializedList))
                        })
                        .catch(next)
})
//.post(requireAuth ,jsonParser, (req, res, next)=> {

.post(requireAuth,jsonParser, (req, res, next) => {
    const db = req.app.get('db');
    const {category} = req.body;
    const newList = {category};

    for(const [key, value] of Object.entries(newList))
    if(value ==null)
    return res.status(400).json({
        error: {message : `Missing '${key}' in request body`}
    })
   newList .user_id = req.user.id;

    SpendingListService.insertSpendingList(db, newList)
                        .then(list=> {
                            res.status(201)
                                .location(path.posix.join(req.originalUrl , `/${list.id}`))
                                .json(serializedList(list))
                        })
                        .catch(next)
})

spendingListRouter
.route('/:slist_id')
.all(requireAuth)
.all((req, res, next)=> {
    const db = req.app.get('db')

    SpendingListService.getSpendingListById(db, req.params.slist_id)
                        .then(list => {
                            if(!list){
                                return res.status(404).json({
                                    error: {message: `List doesn't exist`}
                                })
                            }
                            res.list = list;
                            next();
                        })
                        .catch(next)
})
.get((req, res, next) => {
    res.json(serializedList(res.list))
})
.delete((req, res, next) => {
    const db = req.app.get('db')

    SpendingListService.deleteSpendingList(db, req.params.slist_id)
                        .then(()=> {
                            res.status(204).end()
                        })
                        .catch(next)
})
.patch(requireAuth,jsonParser, (req, res, next)=> {
    const db = req.app.get('db')
    const {category} = req.body;
    const ListToUpdate = {category};

    const numberOfValues = Object.values(ListToUpdate).filter(Boolean).length;
    if(numberOfValues === 0)
    return res.status(400).json({
        error : {message: `Request body must contain 'category' or 'user_id'`}
    })
    ListToUpdate.user_id = req.user.id;


    SpendingListService.updateSpendingList(db, req.params.slist_id, ListToUpdate)
                        .then(()=> {
                            res.status(204).end()
                        })
                        .catch(next)

})


module.exports = spendingListRouter;