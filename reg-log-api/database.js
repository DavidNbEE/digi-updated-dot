const mysql =  require('mysql')

const pool = mysql.createPool({
    socketPath: "yoursocketpath",
    user: "root",
    password: "Dyourpassword",
    database: "yourdatabase",
  })

module.exports = pool