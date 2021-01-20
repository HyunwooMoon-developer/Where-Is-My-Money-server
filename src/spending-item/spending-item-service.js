/* eslint-disable no-undef */
const SpendingItemService = {
    getAllSpendingItem(knex){
        return knex
            .select('*')
            .from('wimm_spending_item');
    },
    insertSpendingItem(knex, newItem){
        return knex
            .insert(newItem)
            .into('wimm_spending_item')
            .returning('*')
            .then(rows=> {
                return rows[0]
            })
    },
    getSpendingItemById(knex, id){
        return knex
            .from('wimm_spending_item')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteSpendingItem(knex, id){
        return knex('wimm_spending_item')
                .where({id})
                .delete()
    },
    updateSpendingItem(knex, id, updateItem){
        return knex('wimm_spending_item')
                .where({id})
                .update(updateItem)
    }
}

module.exports = SpendingItemService;