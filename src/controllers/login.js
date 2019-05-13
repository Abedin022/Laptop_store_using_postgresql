const { User } = require('../utils/db')
const _p = require('../utils/promise_errors')
const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { check } = require('express-validator/check')
const { validate } = require('../utils/passwords')
const { app_secret } = require('../config.json')
const rejectInvalid = require('../middlewares/reject_invalid')
const loginValidator = [check('email').isEmail(), check('password').isLength({ min: 5 })]

router.get('/login', function (req, res) {
  res.render('login_form')
})

router.post('/login', loginValidator, rejectInvalid, async (req, res, next) => {
  let { password, email } = req.body

  let [uer, user] = await _p(User.findAndCountAll({
    where: {
      email
    }
  }))
  if (uer && !user) {
    return next(uer)
  } else {
    if (user.count == 0) {
      res.render('error_page', { id: 404 })
      // return next(new Error('No Such User'))
    } else {
      let { name, email, id } = user.rows[0]

      let [salt, hash] = user.rows[0].password.split('.')

      let valid = validate(password, hash, salt)
      if (valid) {
        let token = jwt.sign({ id, name, email }, app_secret)
        res.render('profile')
        /*
        res.json({
          error: false,
          token,
          user: {
            id, name, email
          }
        })
        */
      } else {
        // res.render('/error')
        res.render('error_page', { title: 'edit blog', id: 405 })
      }
    }
  }
})

module.exports = router
