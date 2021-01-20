/* eslint-disable no-undef */
const UsersService={
    getAllUsers(knex){
        return knex.select('*').from('wimm_user')
    },
    insertUser(knex, newUser){
        return knex
            .insert(newUser)
            .into('wimm_user')
            .returning('*')
            .then(row=> {
                return row[0]
            })
    },
    getUserById(knex, id){
        return knex
            .from('wimm_user')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteUser(knex, id){
        return knex('wimm_user')
                .where({id})
                .delete()
    },
    updateUser(knex, id, updateUser){
        return knex('wimm_user')
                .where({id})
                .update(updateUser)
    },
    

}

module.exports = UsersService;