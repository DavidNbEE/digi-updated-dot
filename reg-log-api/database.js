const mysql =  require('mysql')

const pool = mysql.createPool({
    socketPath: "/cloudsql/testing-diginote-2023:us-central1:test-digi-base",
    user: "root",
    password: "DigiNote69",
    database: "digibase-test",
  })

module.exports = pool