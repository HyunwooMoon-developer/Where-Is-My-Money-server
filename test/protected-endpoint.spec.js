/* eslint-disable no-undef */
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./helpers')


describe(`Protected endpoints`, ()=> {
    let db

    const {testUsers, testIncome} = helpers.makeWimmArray()

    before('make knex instance' , ()=> {
        db = knex({
            client  : 'pg',
            connection : process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', ()=> db.destroy())
    before('cleanup', ()=> helpers.cleanTable(db))
    afterEach('cleanup', ()=> helpers.cleanTable(db))

    beforeEach('insert incomes' , ()=> 
        helpers.seedIncomesTables(
            db,
            testUsers,
            testIncome,
        )
    )

    const protectedEndpoints = [
        {
            name : 'GET /api/incomes/:income_id',
            path : '/api/incomes/1'
        }
    ]

    protectedEndpoints.forEach(endpoint=> {
    describe(endpoint.name , ()=> {
        it(`responds with 401 'Missing basic token' when no bearer token`, ()=> {
            return supertest(app)
                .get(endpoint.path)
                .expect(401, {error : `Missing bearer token`})
        })
        it(`Responds 401 'unauthorized request' when invalid JWT secret`, ()=> {
            const validUser = testUsers[0];
            const invalidSecret = 'bad-secret';

            return supertest(app)  
                    .get(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                    .expect(401, {error : `Unauthorized Request`})
        })
        it(`Responds 401 'unauthorized request' when invalid sub in playload`, ()=> {
            const invalidUser = {user_name : 'user-not-existy', id : 1}
            
            return supertest(app)
                .get(endpoint.path)
                .set('Authorization' , helpers.makeAuthHeader(invalidUser))
                .expect(401, {error :  `Unauthorized Request`})
        })
       
    })
  })
})