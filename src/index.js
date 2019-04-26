const express = require('express')
const bp = require('body-parser')
const signup = require('./controllers/signup')
const login = require('./controllers/login')
const auth = require('./middlewares/auth')
const path = require('path')
const app = express()
const errh = require('./middlewares/error_handler')
// Middlewares
app.use(bp.urlencoded({
  extended: false
}))
app.use(bp.json())
app.use('/api', auth)
app.use('/resource', auth)
// Routes
app.use(signup)
app.use(login)

app.get('/', function (req, res) {
  res.render('login_form')
})

// view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(errh)
const _port = process.env.PORT || 4000
app.listen(_port, () => {
  console.log(`Application listening on port: ${_port}`)
})
