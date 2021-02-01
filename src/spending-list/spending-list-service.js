/* eslint-disable no-undef */
const SpendingListService = {
  getAllSpendingList(knex) {
    return knex.select("*").from("wimm_spending_list");
  },
  insertSpendingList(knex, newList) {
    return knex
      .insert(newList)
      .into("wimm_spending_list")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getSpendingListById(knex, id) {
    return knex.from("wimm_spending_list").select("*").where("id", id).first();
  },
  deleteSpendingList(knex, id) {
    return knex("wimm_spending_list").where({ id }).delete();
  },
  updateSpendingList(knex, id, updateList) {
    return knex("wimm_spending_list").where({ id }).update(updateList);
  },
};

module.exports = SpendingListService;
