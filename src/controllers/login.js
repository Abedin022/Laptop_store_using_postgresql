const { User } = require('../utils/db')
const _p = require('../utils/promise_errors')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { check } = require('express-validator/check')
const { validate } = require('../utils/passwords')
const { app_secret } = require('../config.json')
const rejectInvalid = require('../middlewares/reject_invalid')
const loginValidator = [check('email').isEmail(), check('password').isLength({ min: 5 })]
var count = 0

router.get('/login', function (req, res) {
  res.render('login_form')
})

router.post('/login', loginValidator, rejectInvalid, async (req, res, next) => {
  let { password, email } = req.body

  User.findAndCountAll({
    where: {
      email
    }
  }).then(result => {
    if (result.count === 0) {
      count = result.count
      next(new Error('No Such User'))
    }
  })

  if (count !== 0) {
    let [uer, user] = await _p(User.findOne({
      where: {
        email
      }
    }))
    if (uer && !user) {
      console.log(uer)
      // console.log(user)
      return next(uer)
    } else {
      // console.log(user.password);
      let [salt, hash] = user.password.split('.')
      let { name, email, id } = user
      let valid = validate(password, hash, salt)
      if (valid) {
        let token = jwt.sign({ id, name, email }, app_secret)
        console.log('Login Successful')
        res.render('success_login')
        res.json({
          error: false,
          token,
          user: {
            id, name, email
          }
        })
      } else {
        next(new Error('Password Invalid'))
      }
    }
  }
})

module.exports = router
