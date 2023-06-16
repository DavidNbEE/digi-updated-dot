const mysql =  require('mysql')

const pool = mysql.createPool({
    host: "your-host-name",
    user: "root",
    password: "your-password",
    database: "your-database",
  })

module.exports = pool
