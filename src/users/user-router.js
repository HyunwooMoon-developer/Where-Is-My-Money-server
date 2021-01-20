/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const path = require('path');
const express = require('express');
const xss = require('xss');
const UsersService = require('./user-service');

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = user => ({
    id: user.id,
    user_name: xss(user.user_name),
    full_name: xss(user.full_name),
    password : user.password,
    date_created : user.date_created,
})

usersRouter
.route('/')
.get((req, res, next)=> {
    const db = req.app.get('db')

    UsersService.getAllUsers(db)
        .then(users=> {
            res.json(users.map(serializeUser))
        })
        .catch(next)
})
.post(jsonParser,(req, res, next) => {
    const db = req.app.get('db')
    const {user_name, full_name, password} = req.body;
    const newUser = {user_name, full_name, password};

    for(const [key, value] of Object.entries(newUser)){
        if(value == null){
            return res.status(400).json({
                error : {message: `Missing '${key}' in request body`}
            })
        }
    }
    newUser.password = password;

    UsersService.insertUser(db, newUser)
    .then(user=>{
        res.status(201)
           .location(path.posix.join(req.originalUrl, `/${user.id}`))
           .json(serializeUser(user))
       })
       .catch(next)    
})  

usersRouter
.route('/:user_id')
.all((req, res, next) => {
    const db = req.app.get('db')

    UsersService.getUserById(db,req.params.user_id)
    .then(user=> {
        if(!user){
            return res.status(404).json({
                error: {message : `User doesn't exist`}
            })
        }
        res.user = user;
        next();
    })
    .catch(next)
})
.get((req, res, next) => {
    res.json(serializeUser(res.user))
})
.delete((req, res, next)=> {
    const db = req.app.get('db')
    
    UsersService.deleteUser(db, req.params.user_id)
                .then(()=> {
                    res.status(204).end()
                })
})

.patch(jsonParser, (req, res, next) => {
    const db = req.app.get('db')
    const {user_name, full_name, password} = req.body;
    const userToUpdate = {user_name, full_name, password};

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if(numberOfValues === 0)
    return res.status(400).json({
        error: {message: `Requset body must contain 'user_name', 'full_name' or 'password'`}
    })

    UsersService.updateUser(db, req.params.user_id, userToUpdate)
                .then(()=> {res.status(204).end()
                })
                .catch(next)

})

module.exports = usersRouter;