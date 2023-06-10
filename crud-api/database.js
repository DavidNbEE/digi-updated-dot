const mysql =  require('mysql')

const pool = mysql.createPool({
    host: "34.31.254.30",
    user: "root",
    password: "DigiNote69",
    database: "digibase-test",
  })

module.exports = pool