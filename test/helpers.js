/* eslint-disable no-undef */
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

function makeIncomeArray(){
    return [
        {
            id: 1,
            start_time : "9", 
            end_time : "18", 
            hourly_payment : "12.00", 
            daily_extra : "20.00", 
            user_id : 1,
            date_created:'2021-01-20T16:28:32.615Z',
        },
        {
            id: 2,
            start_time : "10", 
            end_time : "18", 
            hourly_payment : "12.00", 
            daily_extra : "20.00", 
            user_id : 2,
            date_created:'2021-01-20T16:28:32.615Z',
        },
        {
            id: 3,
            start_time : "11", 
            end_time : "18", 
            hourly_payment : "12.00", 
            daily_extra : "20.00", 
            user_id : 3,
            date_created:'2021-01-20T16:28:32.615Z',
        }
    ]
}

function makeListArray(){
    return [
        {
            id: 1 ,
            category: "food",
            user_id: 1,
        },
        {
            id: 2 ,
            category: "shopping",
            user_id: 2,
        },
        {
            id: 3 ,
            category: "utility",
            user_id: 3,
        }
    ]
}

function makeItemArray(){
    return [
        {
            id : 1,
            category_id : 1,
            item_name : "Galleria Market",
            spending : "18.00",
            content : 'Fruit, Meat, Milk',
            date_created:'2021-01-20T16:28:32.615Z',
        },
        {
            id : 2,
            category_id : 2,
            item_name : 'Nike',
            spending : "48.00",
            content : 'Nike shoes',
            date_created:'2021-01-20T16:28:32.615Z',
        },
        {
            id : 3,
            category_id : 3,
            item_name : 'LADWP',
            spending : "18.00",
            content : 'Electric Fee',
            date_created:'2021-01-20T16:28:32.615Z',
        }
    ]
}

function makeUsersArray(){
    return [
        {
            id: 1,
            user_name: 'test-user1',
            full_name: 'test-fullname1',
            password: 'testpass',
            date_created:'2021-01-20T16:28:32.615Z',
            
        },
        {
            id: 2,
            user_name: 'test-user2',
            full_name: 'test-fullname2',
            password: 'testpass',
            date_created:'2021-01-20T16:28:32.615Z',
        },
        {
            id: 3,
            user_name: 'test-user3',
            full_name: 'test-fullname3',
            password: 'testpass',
            date_created:'2021-01-20T16:28:32.615Z',
        },

    ]
}

function makeWimmArray(){
    const testIncome = makeIncomeArray();
    const testUsers = makeUsersArray();
    const testLists = makeListArray();
    const testItems = makeItemArray();

    return {testUsers, testIncome, testLists , testItems} 
}


function cleanTable(db){
    return db.transaction(trx=>
        trx.raw(
            `TRUNCATE wimm_user, wimm_income, wimm_spending_list, wimm_spending_item`
        )
        .then(()=> 
        Promise.all([
            trx.raw(`ALTER SEQUENCE wimm_user_id_seq minvalue 0 START WITH 1`),
            trx.raw(`ALTER SEQUENCE wimm_income_id_seq minvalue 0 START WITH 1`),
            trx.raw(`ALTER SEQUENCE wimm_spending_list_id_seq minvalue 0 START WITH 1`),
            trx.raw(`ALTER SEQUENCE wimm_spending_item_id_seq minvalue 0 START WITH 1`),
            trx.raw(`SELECT setval('wimm_user_id_seq', 0)`),
            trx.raw(`SELECT setval('wimm_income_id_seq', 0)`),
            trx.raw(`SELECT setval('wimm_spending_list_id_seq', 0)`),
            trx.raw(`SELECT setval('wimm_spending_item_id_seq', 0)`),
        ])
        )
        )
}

function seedUsers(db, users){
    const preppedUsers = users.map(user=> ({
        ...user,
        password : bcrypt.hashSync(user.password, 1)
    }))
    return db.into('wimm_user').insert(preppedUsers)
            .then(()=>
            //update the auto sequence to stay in sync
            db.raw(
                `SELECT setval('wimm_user_id_seq', ?)`,
                [users[users.length -1].id],
            )
        )
}

function seedIncomesTables(db, users, incomes){
    //use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx=>{
        await seedUsers(trx, users)
        await trx.into('wimm_income').insert(incomes)
        //update the auto sequnce to match the forced id values
        await Promise.all([
            trx.raw(
                `SELECT setval('wimm_income_id_seq', ?)`,
                [incomes[incomes.length -1].id],
            ),
        ])
    })
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET){
    const token = jwt.sign({user_id: user.id}, secret, {
        subject : user.user_name,
        algorithm : 'HS256',
    })
    return `Bearer ${token}`
}


module.exports = {
    makeIncomeArray,
    makeUsersArray,
    makeListArray,
    makeWimmArray,
    makeItemArray,


    cleanTable,
    seedIncomesTables,
    makeAuthHeader,
    seedUsers
}