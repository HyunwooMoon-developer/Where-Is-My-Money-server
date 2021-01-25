/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const path = require('path');
const express = require('express');
const incomeService = require('./income-service');
const {requireAuth} = require('../middleware/jwt-auth');

const incomeRouter = express.Router();
const jsonParser = express.json();

const serializeIncome = income => ({
    id: income.id,
    start_time : income.start_time,
    end_time : income.end_time,
    hourly_payment : income.hourly_payment,
    daily_extra : income.daily_extra, 
    user_id : income.user_id,
    date_created: income.date_created
});


incomeRouter
.route('/')
.get((req, res, next) => {
    const db = req.app.get('db');
    incomeService.getAllIncome(db)
        .then(incomes => {
            res.json(incomes.map(serializeIncome))
        })
        .catch(next)
})
//.post(requireAuth,jsonParser, (req, res, next) => {
.post(requireAuth , jsonParser, (req, res, next) => {
    const {start_time, end_time, hourly_payment, daily_extra} = req.body;
    const newIncome = {start_time, end_time, hourly_payment, daily_extra};
    const db = req.app.get('db');

    for(const [key, value] of Object.entries(newIncome))
    if(value == null)
    return res.status(400).json({
        error: {message : `Missing '${key}' in request body`}
    })
    newIncome.user_id = req.user.id
    //newIncome.date_created = date_created;

    incomeService.insertIncome(db, newIncome)
                 .then(income=>{
                     res.status(201)
                        .location(path.posix.join(req.originalUrl, `/${income.id}`))
                        .json(serializeIncome(income))
                    })
                    .catch(next)    
})

incomeRouter
.route('/:income_id')
.all(requireAuth)
.all((req, res, next) => {
    const db = req.app.get('db');
    incomeService.getIncomeById(db,req.params.income_id)
                .then(income => {
                    if(!income){
                        return res.status(404).json({
                            error: {message: `Income doesn't exist`}
                        })
                    }
                    res.income = income //save the income for the next middleware
                    next()
                })
                .catch(next)
})
.get((req, res, next) => {
    res.json(serializeIncome(res.income))
})
.delete((req, res, next)=> {
    const db = req.app.get('db');
    incomeService.deleteIncome(db, req.params.income_id)
                .then(()=>{
                    res.status(204).end()
                })
                .catch(next)
})
.patch(requireAuth ,jsonParser, (req, res, next)=> {
    const {start_time, end_time, hourly_payment, daily_extra } = req.body;
    const incomeToUpdate = {start_time, end_time, hourly_payment, daily_extra};
    const db = req.app.get('db');

    const numberOfValues = Object.values(incomeToUpdate).filter(Boolean).length;
    if(numberOfValues === 0)
    return res.status(400).json({
        error: {message: `Request body must contain either 'start_time', 'end_time', 'hourly_payment', 'daily_extra'`,}
    })

    incomeToUpdate.user_id = req.user.id
    //console.log("req.params.income_id : ", req.params.income_id)
    incomeService.updateIncome(db, req.params.income_id, incomeToUpdate)
                .then(()=> {
                    res.status(204).end()
                })
                .catch(next)

})  


module.exports = incomeRouter;