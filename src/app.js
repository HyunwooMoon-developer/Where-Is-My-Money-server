/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const {NODE_ENV} = require('./config');
const errorHandler = require('./errorHandler')
//const validateBearerToken = require('./validateBearerToken')
const logger = require('./logger');
const incomeRouter = require('./income/income-router')
const usersRouter = require('./users/user-router')
const spendingItemRouter = require('./spending-item/spending-item-router')
const spendingListRouter = require('./spending-list/spending-list-router')
const authRouter = require('./auth/auth-router')

const app = express()
//pipeline begins
//standard middleware
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

//route
app.get('/', (req, res) => {
    res.send('Hello, boilerplate!');
})

app.use('/api/incomes', incomeRouter);
//app.use(`/api/users`, usersRouter);
app.use('/api/sitems', spendingItemRouter);
app.use(`/api/slists`, spendingListRouter);
app.use('/api/auth', authRouter);
//app.use('/api/users', usersRouter);

//app.use(validateBearerToken);

//error handler
app.use(errorHandler);

module.exports = app