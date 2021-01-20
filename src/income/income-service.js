/* eslint-disable no-undef */
const incomeService = {
    getAllIncome(knex){
        return knex
            .select('*')
            .from('wimm_income');
    },
    insertIncome(knex, newIncome){
        return knex
            .insert(newIncome)
            .into('wimm_income')
            .returning('*')
            .then(rows=> {
                return rows[0]
            })
    },
    getIncomeById(knex, id){
        return knex
            .from('wimm_income')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteIncome(knex, id){
        return knex('wimm_income')
                .where({id})
                .delete()
    },
    updateIncome(knex, id, updateIncome){
        return knex('wimm_income')
                .where({id})
                .update(updateIncome)
    }
}

module.exports = incomeService;