const express = require('express')
const app = express()
const routes = require('./routes')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(routes)

const port = 3000

app.listen(port, ()=> {
    console.log(`server berjalan di http://localhost:${port}`)
})