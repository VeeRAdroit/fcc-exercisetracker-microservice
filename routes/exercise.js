var express = require('express')
var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

/*
I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id).
Return will be the user object with added array log and count (total exercise count).

I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit.
(Date format yyyy-mm-dd, limit = int)
*/

router.get('/log', function (req, res) {
  res.send('Birds home page')
})

/* 
I can get an array of all users by getting api/exercise/users with the same info as when creating a user. 
*/
router.get('/users', function (req, res) {
  res.send('About birds')
})


/*
I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and _id.
*/

router.post('/new-user', function (req, res) {
  res.send('About birds')
})

/* 
I can add an exercise to any user by posting form data userId(_id), description, duration, and optionally date to /api/exercise/add.
If no date supplied it will use current date. Returned will the the user object with also with the exercise fields added.
*/
router.post('/add', function (req, res) {
  res.send('About birds')
})

module.exports = router