/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./helpers');

describe(`Spending-List Endpoints`, ()=> {
    let db;

    const {testLists, testUsers} = helpers.makeWimmArray();

    before('make knex instance', ()=> {
        db=knex({
            client : 'pg',
            connection : process.env.TEST_DATABASE_URL,
        })

        app.set('db', db)
    })

    after('disconnect from db', ()=> db.destroy())
    before('cleanup', ()=> helpers.cleanTable(db))
    afterEach('cleanup', ()=> helpers.cleanTable(db))


    describe(`GET /api/slists` , ()=> {
        context(`Given no lists`, ()=> {
            it(`Responds with 200 and an empty list`, ()=> {
                return supertest(app)
                        .get(`/api/slists`)
                        .expect(200, [])
            })
        })
        context(`Given there are lists in the database` , ()=> {
            beforeEach('Insert Lists' , ()=> {
                return helpers.seedSpendingListTables(
                    db,
                    testUsers,
                    testLists
                )
                })
            it(`GET /api/slists responds with 200 and all of the lists`, ()=>{
               return supertest(app)
                    .get(`/api/slists`)
                    .expect(200, testLists);

            })
            it(`GET /api/slists/:slist_id responds with 200 and the specific list` ,()=> {
                const listId = 2;
                const expectedList = testLists[listId -1];

                return supertest(app)
                        .get(`/api/slists/${listId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, expectedList)
            })

        })
    })
    describe(`POST /api/slists` , ()=> {
        beforeEach(`Insert malicious user` ,()=> {
            helpers.seedUsers(db, testUsers)
        })
        it(`Create a list, responding with 201 and the new list`,()=>{
            const newList={
                category : 'game',
                user_id: 1
            }
            return supertest(app)
                    .post(`/api/slists`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newList)
                    .expect(201)
                    .expect(res=> {
                        //console.log("res:", res)
                        expect(res.body.category).to.eql(newList.category)
                        expect(res.body.user_id).to.eql(newList.user_id)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/slists/${res.body.id}`)
                    })
                    .then(res=>
                        supertest(app)
                            .get(`/api/slists/${res.body.id}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(res.body)
                        )
                    })
        
    })
    describe(`DELETE /api/slists/:slist_id` , ()=> {
        context(`Given no data` , ()=> {
            beforeEach('Insert Lists' , ()=> {
                return helpers.seedSpendingListTables(
                    db,
                    testUsers,
                    testLists
                )
                })
            it(`Responds with 404`, ()=> {
                const listId = 123456;

                return supertest(app)
                        .delete(`/api/slists/${listId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(404,{
                            error: {message : `List doesn't exist`}
                        })
            })
        })
        context(`Given there are list in the database` , ()=> {
            beforeEach('Insert Lists' , ()=> {
                return helpers.seedSpendingListTables(
                    db,
                    testUsers,
                    testLists
                )
                    
                })
            it(`Responds with 204 and removes the list`, ()=> {
                const idToRemove = 1;
                const expectedList = testLists.filter(list => list.id !== idToRemove)

                return supertest(app)
                    .delete(`/api/slists/${idToRemove}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res=>
                        supertest(app)
                            .get(`/api/slists`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedList)
                        )
            })
        })
        
    })
    describe(`PATCH /api/slists/:slist_id` , ()=> {
        context(`Given no data` , ()=> {
            beforeEach('Insert Lists' , ()=> {
                return helpers.seedSpendingListTables(
                    db,
                    testUsers,
                    testLists
                )
                })
            it(`Responds with 404`, ()=> {
                const listId = 123456;

                return supertest(app)
                        .patch(`/api/slists/${listId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(404, {
                            error: {message: `List doesn't exist`}
                        })
            })
        })
        context(`Given there are the lists in the database` , ()=> {
            beforeEach('Insert Lists' , ()=> {
                return helpers.seedSpendingListTables(
                    db,
                    testUsers,
                    testLists
                )
                })
            it(`Responds with 204 and update the income`, ()=> {
                const idToUpdate = 2;
                const ListToUpdate = {
                    category : 'game',
                    user_id: 1
                }

                const expectedList = {
                    ...testLists[idToUpdate -1],
                    ...ListToUpdate
                }

                return supertest(app)
                        .patch(`/api/slists/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(ListToUpdate)
                        .expect(204)
                        .then(res=> 
                            supertest(app)
                            .get(`/api/slists/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedList)
                            )
                        
            })
            it(`Responds with 400 when updating only a subset of fields`, ()=> {
                const idToUpdate = 1;
                
                return supertest(app)
                        .patch(`/api/slists/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send({irrelevantField : 'foo'})
                        .expect(400 ,
                         {error : {message: `Request body must contain 'category' or 'user_id'`}})
            })
            it(`Responds with 204 when updating only a subset of fields` , ()=> {
                const idToUpdate = 2;
                const ListToUpdate = {
                    category : 'game',
                    user_id: 1
                }

                const expectedList = {
                    ...testLists[idToUpdate -1],
                    ...ListToUpdate
                }

                return supertest(app)
                        .patch(`/api/slists/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send({
                            ...ListToUpdate,
                            fieldToIgnore : `Should not be in GET response`
                        })
                        .expect(204)
                        .then(res=> 
                            supertest(app)
                                .get(`/api/slists/${idToUpdate}`)
                                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                .expect(expectedList)
                            )
            })
        })
    })
})