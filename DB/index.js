const {Pool} = require('pg');
const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});

// Hosted DB
let connectionString = process.env.DATABASE_URL;
connectionString = connectionString.replace("[YOUR-PASSWORD]", process.env.DATABASE_PASSWORD);
console.log(connectionString)
// Local DB
// exports.pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'mcalab',
//     password: 'pass1234',
//     port: 5432,
// })

exports.pool = new Pool({connectionString});