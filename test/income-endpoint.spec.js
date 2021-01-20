/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./helpers');

describe.only(`Income Endpoints`, ()=> {
    let db;


    before('make knex instance', ()=> {
        db=knex({
            client : 'pg',
            connection : process.env.TEST_DB_URL,
        })

        app.set('db', db)
    })

    after('disconnect from db', ()=> db.destroy())
    before('cleanup', ()=> db.raw(`TRUNCATE wimm_user, wimm_income, wimm_spending_list, wimm_spending_item RESTART IDENTITY CASCADE`))
    afterEach('cleanup',  ()=> db.raw(`TRUNCATE wimm_user, wimm_income, wimm_spending_list, wimm_spending_item RESTART IDENTITY CASCADE`))

    describe(`GET /api/income`, ()=> {
        context('Given no incomes' , ()=> {
            it(`Responds with 200 and an empty list`, ()=> {
                return supertest(app)
                        .get('/api/income')
                        .expect(200, [])
            } )
        })
        context('Given there are incomes in the database', ()=> {
            //const testUsers = helpers.makeUsersArray();
            const testIncome = helpers.makeIncomeArray();

            beforeEach('Insert incomes' , ()=> {
                        return db
                            .into('wimm_income')
                            .insert(testIncome)
            })
            it(`responds with 200 and all of the incomes`, ()=> {
                return supertest(app)
                        .get('/api/income')
                        .expect(200, testIncome);
            })
        })
    })

})