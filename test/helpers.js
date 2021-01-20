/* eslint-disable no-undef */
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

    return {testUsers, testIncome} 
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


module.exports = {
    makeIncomeArray,
    makeUsersArray,
    cleanTable,
    makeWimmArray
}