/* eslint-disable no-undef */
require('dotenv').config();

module.exports = {
    "migrationsDirectory" : "migrations",
    "driver": "pg",
    "connectionString" : process.env.DB_URL,
}