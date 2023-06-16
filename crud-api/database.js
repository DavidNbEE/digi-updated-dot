const mysql =  require('mysql')

const pool = mysql.createPool({
    host: "your-host",
    user: "root",
    password: "your-password",
    database: "your-database",
  })

module.exports = pool
