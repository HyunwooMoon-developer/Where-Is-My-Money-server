/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./helpers');

describe(`Spending Items Endpoints` , () => {
    let db ;

    const {testUsers ,testLists, testItems} = helpers.makeWimmArray();

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

    describe(`GET /api/sitems` , () => {
        context(`Given no items` , ()=> {
            it(`Responds with 200 and an empty item` , ()=> {
                return supertest(app)
                        .get(`/api/sitems`)
                        .expect(200, [])
            })
        })
        context(`Given there are items in the database` , ()=> {
            beforeEach('insert Items' , ()=> {
                return db
                .into('wimm_user')
                .insert(testUsers)
                .then(()=> {
                    return db
                    .into('wimm_spending_list')
                    .insert(testLists)
                    .then(()=> {
                        return db
                        .into('wimm_spending_item')
                        .insert(testItems)
                    })
                })
            })
            it(`GET /api/sitems responds with 200 and all of the items` , ()=> {
                return supertest(app)
                        .get(`/api/sitems`)
                        .expect(200, testItems)
                        /*.then(res => {
                            console.log(res.body)
                            console.log(testItems)
                            expect(res.body).to.eql(testItems)
                        })*/
            })
            it(`GET /api/sitems/:sitem_id responds with 200 and specific item` , ()=>{
                const itemId = 1;
                const expectedItem = testItems[itemId -1];

                return supertest(app)
                        .get(`/api/sitems/${itemId}`)
                        .expect(200, expectedItem)
            })
        })
    })
    describe(`POST /api/sitems`, ()=> {
        beforeEach(`Insert malicious list`, ()=> {
            return db
                .into('wimm_user')
                .insert(testUsers)
                .then(()=> {
                    return db
                    .into('wimm_spending_list')
                    .insert(testLists)
            })
        })
        it(`Create an item, responding with 201 and the new item` , ()=> {
            const newItem = {
                category_id : 1,
                item_name : "Market",
                spending : "18.00",
                content : 'Fruit, Meat, Milk',
            }

            return supertest(app)
                    .post(`/api/sitems`)
                    .send(newItem)
                    .expect(201)
                    .expect(res=> {
                        expect(res.body.category_id).to.eql(newItem.category_id)
                        expect(res.body.item_name).to.eql(newItem.item_name)
                        expect(res.body.spending).to.eql(newItem.spending)
                        expect(res.body.content).to.eql(newItem.content)
                        expect(res.body).to.have.property('id')
                        expect(res.headers.location).to.eql(`/api/sitems/${res.body.id}`)
                        const expected = new Intl.DateTimeFormat(`en-US`).format(new Date())
                        const actual = new Intl.DateTimeFormat('en-US').format(new Date(res.body.date_created))
                        expect(actual).to.eql(expected)
                    })
                    .then(res=>
                            supertest(app)
                                .get(`/api/sitems/${res.body.id}`)
                                .expect(res.body)
                        )
        })
    })
    describe(`DELETE /api/sitems/:sitem_id` , ()=> {
        context(`Given no data` , ()=> {
            it(`Responds with 404`, ()=> {
                const itemId = 123456;
                
                return supertest(app)
                        .delete(`/api/sitems/${itemId}`)
                        .expect(404, {
                            error : {message: `Item doesn't exist`}
                        })
            })
        })
        context(`Given there are items in the database` , ()=> {
            beforeEach('insert Items' , ()=> {
                return db
                .into('wimm_user')
                .insert(testUsers)
                .then(()=> {
                    return db
                    .into('wimm_spending_list')
                    .insert(testLists)
                    .then(()=> {
                        return db
                        .into('wimm_spending_item')
                        .insert(testItems)
                    })
                })
            })
            it(`Responds with 204 and removes the item` , ()=> {
                const idToRemove = 2;
                const expectedItem = testItems.filter(item => item.id !== idToRemove)

                return supertest(app)
                        .delete(`/api/sitems/${idToRemove}`)
                        .expect(204)
                        .then(res=>
                            supertest(app)
                                .get(`/api/sitems`)
                                .expect(expectedItem)
                            )
            })
        })
    })
    describe(`PATCH /api/sitems/:sitem_id` ,()=> {
        context(`Given no data` , ()=> {
            it(`Responds with 404`, ()=> {
                const itemId = 123456;
                
                return supertest(app)
                        .patch(`/api/sitems/${itemId}`)
                        .expect(404, {
                            error : {message: `Item doesn't exist`}
                        })
            })
        })
        context(`Given there are items in the database` , ()=> {
            beforeEach('insert Items' , ()=> {
                return db
                .into('wimm_user')
                .insert(testUsers)
                .then(()=> {
                    return db
                    .into('wimm_spending_list')
                    .insert(testLists)
                    .then(()=> {
                        return db
                        .into('wimm_spending_item')
                        .insert(testItems)
                    })
                })
            })
            it(`Responds with 204 and update the item` , ()=> {
                const idToUpdate = 1;
                const itemToUpdate = {
                    category_id : 1,
                    item_name : "Market",
                    spending : "18.00",
                    content : 'Fruit, Meat, Milk',
                }
                const expectedItem = {
                    ...testItems[idToUpdate -1],
                    ...itemToUpdate
                }

                return supertest(app)
                        .patch(`/api/sitems/${idToUpdate}`)
                        .send(itemToUpdate)
                        .expect(204)
                        .then(res=> 
                            supertest(app)
                                .get(`/api/sitems/${idToUpdate}`)
                                .expect(expectedItem)
                            )
            })
            it('Responds with 400 when updating only a subset of fields' , ()=> {
                const idToUpdate = 1;

                return supertest(app)
                        .patch(`/api/sitems/${idToUpdate}`)
                        .send({irrelevantField : 'foo'})
                        .expect(400, {
                          error :  {messge: `Request body must contain either 'category_id', 'item_name', 'spending' or 'content'`}
                        })
            })
            it(`Responds with 204 when updating only a subset of fields` , ()=> {
                const idToUpdate = 1;
                const itemToUpdate = {
                    category_id : 1,
                    item_name : "Market",
                    spending : "18.00",
                    content : 'Fruit, Meat, Milk',
                }
                const expectedItem = {
                    ...testItems[idToUpdate -1],
                    ...itemToUpdate
                }

                return supertest(app)
                    .patch(`/api/sitems/${idToUpdate}`)
                    .send({
                        ...itemToUpdate,
                        fieldToIgnore : `Should not be in GET response`
                    })
                    .expect(204)
                    .then(res=> 
                        supertest(app)
                            .get(`/api/sitems/${idToUpdate}`)
                            .expect(expectedItem)
                        )
            })
        })
    })

})