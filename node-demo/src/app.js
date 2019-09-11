const express = require('express')
const app = express()
require('./db/mongoose');
const userrouter = require('./router/userRoutes');
const bodyParser = require('body-parser')
var cors = require('cors');
const port = process.env.PORT || 3002
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
 app.use('/',userrouter)

app.listen(port, ()=>{ 
     console.log('srever is listening on port: '+port)
})