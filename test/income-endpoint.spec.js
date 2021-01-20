/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./helpers');

describe.only(`Income Endpoints`, ()=> {
    let db;

    const {testIncome, testUsers} = helpers.makeWimmArray();

    before('make knex instance', ()=> {
        db=knex({
            client : 'pg',
            connection : process.env.TEST_DB_URL,
        })

        app.set('db', db)
    })

    after('disconnect from db', ()=> db.destroy())
    before('cleanup', ()=> helpers.cleanTable(db))
    afterEach('cleanup', ()=> helpers.cleanTable(db))
    // afterEach('cleanup',  ()=> db.raw(`TRUNCATE wimm_user, wimm_income, wimm_spending_list, wimm_spending_item RESTART IDENTITY CASCADE`))

    describe(`GET /api/incomes`, ()=> {
        context('Given no incomes' , ()=> {
            it(`Responds with 200 and an empty list`, ()=> {
                return supertest(app)
                        .get('/api/incomes')
                        .expect(200, [])
            } )
        })
        context('Given there are incomes in the database', ()=> {
          

            beforeEach('Insert incomes' , ()=> {
                        return db
                            .into('wimm_user')
                            .insert(testUsers)
                            .then(()=> {
                                return db
                                .into('wimm_income')
                             .insert(testIncome)
                            })
                        })
            it(`GET /api/incomes responds with 200 and all of the incomes`, ()=> {
                return supertest(app)
                        .get('/api/incomes')
                        .expect(200, testIncome);
            })
            it('GET /api/incomes/:income_id responds with 200 and the specific income', () => {
                const incomeId = 2;
                const expectedIncome = testIncome[incomeId -1];
                return supertest(app)
                        .get(`/api/incomes/${incomeId}`)
                        .expect(200, expectedIncome)
            })
        })
    })
    describe(`POST /api/incomes` , ()=> {
        beforeEach('insert malicious user' , ()=> {
            return db
            .into('wimm_user')
            .insert(testUsers)
        })

        it(`Create an income, responding with 201 and the new article` , ()=> {
            const newIncome = {
                start_time : "9", 
                end_time : "18", 
                hourly_payment : "12.00", 
                daily_extra : "20.00", 
                user_id : 1,
            }
            return supertest(app)
                    .post('/api/incomes')
                    .send(newIncome)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.start_time).to.eql(newIncome.start_time)
                        expect(res.body.end_time).to.eql(newIncome.end_time)
                        expect(res.body.hourly_payment).to.eql(newIncome.hourly_payment)
                        expect(res.body.daily_extra).to.eql(newIncome.daily_extra)
                        expect(res.body.user_id).to.eql(newIncome.user_id)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/incomes/${res.body.id}`)
                        const expected = new Intl.DateTimeFormat(`en-US`).format(new Date())
                        const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_created))
                        expect(actual).to.eql(expected)
                    })
                    .then(res=>
                            supertest(app)
                                .get(`/api/incomes/${res.body.id}`)
                                .expect(res.body)    
                             )
        })
       

    })
    describe(`DELETE /api/incomes/:income_id`, ()=> {
        context(`Given no data` , ()=> {
            it('Responds with 404' , ()=> {
                const incomeId = 123456;

                return supertest(app)
                        .delete(`/api/incomes/${incomeId}`)
                        .expect(404, {error : {message : `Income doesn't exist`}})
            })
        })
        context(`Given there are incomes in the database`, ()=> {
            beforeEach('Insert incomes' , ()=> {
                return db
                    .into('wimm_user')
                    .insert(testUsers)
                    .then(()=> {
                        return db
                        .into('wimm_income')
                     .insert(testIncome)
                    })
                    })
            it(`Responds with 204 and removes the notes` , ()=> {
                const idToRemove = 2;
                const expectedIncome = testIncome.filter(income=> income.id !== idToRemove)

                return supertest(app)
                        .delete(`/api/incomes/${idToRemove}`)
                        .expect(204)
                        .then(res=>
                                supertest(app)
                                    .get('/api/incomes')
                                    .expect(expectedIncome)
                            )
            })
        })
    })
    describe(`PATCH /api/incomes/:income_id` , ()=> {
        context(`Given no data` , ()=> {
            it(`Responds with 404` , ()=> {
                const incomeId = 123456;

                return supertest(app)
                        .patch(`/api/incomes/${incomeId}`)
                        .expect(404,{
                            error: {message: `Income doesn't exist`}
                        })
            })
        })
        context(`Given there are notes in the database`, ()=> {
            beforeEach('Insert incomes' , ()=> {
                return db
                    .into('wimm_user')
                    .insert(testUsers)
                    .then(()=> {
                        return db
                        .into('wimm_income')
                     .insert(testIncome)
                    })
                    })

            it(`Responds with 204 and update the income`,  ()=> {
                const idToUpdate = 2;
                const updatedIncome = {
                start_time : "9", 
                end_time : "18", 
                hourly_payment : "12.00", 
                daily_extra : "20.00", 
                user_id : 1,
                }
                const expectedIncome = {
                    ...testIncome[idToUpdate -1],
                    ...updatedIncome
                }

                return supertest(app)
                        .patch(`/api/incomes/${idToUpdate}`)
                        .send(updatedIncome)
                        .expect(204)
                        .then(res=>
                            supertest(app)
                                .get(`/api/incomes/${idToUpdate}`)
                                .expect(expectedIncome)
                            )
            })
            it(`Responds wit 204 when updating only a subset of fields`, ()=> {
                const idToUpdate = 1;
                
                return supertest(app)
                        .patch(`/api/incomes/${idToUpdate}`)
                        .send({irrelevantField : 'foo'})
                        .expect(400, {
                            error: {message: `Request body must contain either 'start_time', 'end_time', 'hourly_payment', 'daily_extra'`}
                        })
            })
            it(`Responds with 204 when updating only a subset of fields`, ()=> {
                const idToUpdate = 1;
                const updatedIncome={
                    start_time : "9", 
                    end_time : "18", 
                    hourly_payment : "12.00", 
                    daily_extra : "20.00", 
                    user_id : 1,
                }

                expectedIncome = {
                    ...testIncome[idToUpdate -1],
                    ...updatedIncome
                }
                
                return supertest(app)
                    .patch(`/api/incomes/${idToUpdate}`)
                    .send({
                        ...updatedIncome,
                        fieldToIgnore : `Should not be in GET response`
                    })
                    .expect(204)
                    .then(res=>
                        supertest(app)
                            .get(`/api/incomes/${idToUpdate}`)
                            .expect(expectedIncome)
                        )
            })
        })
    })


})