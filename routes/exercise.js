var express = require('express')
var router = express.Router()
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const exerciseLogSchema = new Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: new Date() }
});
const exerciseSchema = new Schema({
  username: { type: String, required: true },
  log: [exerciseLogSchema]
})
const Exercise = mongoose.model('Exercise', exerciseSchema);


/*
I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id).
Return will be the user object with added array log and count (total exercise count).

I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit.
(Date format yyyy-mm-dd, limit = int)
*/

function getUserQuery(userId) {
  let query = {};
  if(userId) {
    if (userId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: userId }
    } else {
      query = { username: userId }
    }
  }

  return query;
}

function getDateQuery(from, to) {
  let dateQuery = {};
  let query = {};
  if (from) {
    const fromDate = Date.parse(from);
    if (isNaN(fromDate)) {
      throw new Error("Invalid From Date -> " + from)
    }
    query = Object.assign(query, { $gte: new Date(from) });
  }
  if (to) {
    const toDate = Date.parse(to);
    if (isNaN(toDate)) {
      throw new Error("Invalid To Date -> " + to)
    }
    query = Object.assign(query, { $lte: new Date(to) });
  }

  if (Object.keys(query).length !== 0) {
    dateQuery = { log: { $elemMatch: { date: query } } };
  }

  return dateQuery;
}

router.get('/log', function (req, res) {
  const { userId, from, to, limit } = req.query;
  if (!userId) {
    res.status(400).send("userId must be sepcified as query param")
  }
  let userQuery = getUserQuery(userId);
  let dateQuery = {};
  try {
    dateQuery = getDateQuery(from, to);
  } catch (err) {
    res.status(400).send(err.message);
  }

  let query = Object.assign(userQuery, dateQuery);
  console.log(' Log query is ', query);
  Exercise.findOne(query, (err, data) => {
    if (err) {
      console.log(' Err while query ', err);
      res.status(404).send("User not found")
    } else {
      if (data) {
        console.log(' Original log length  ', data.log.length);
        if(limit && !isNaN(limit) && data.log.length > limit) {
          console.log(' Limiting log ', limit);
          data.log.splice(0, limit);
          console.log(' New log length  ', data.log.length);
        }
        res.json(data);
      } else {
        res.status(404).send("No Data found")
      }
    }
  });
})

/* 
I can get an array of all users by getting api/exercise/users with the same info as when creating a user. 
*/
router.get('/users', function (req, res) {
  console.log(' Getting all users ');
  Exercise.find({}, (err, users) => {
    if (err) {
      res.json([]);
    } else {
      res.json(users);
    }
  })
})


/*
I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and _id.
*/

router.post('/new-user', function (req, res) {
  console.log(' Posting new-user ', req.body);
  const { username } = req.body;
  Exercise.findOne({ username }, (err, data) => {
    if (err) {
      res.status(500).json({ error: "Error while Creating User" });
    } else {
      console.log('$$$ existing User ', data);
      if (data) {
        const { _id } = data;
        const result = { _id, username };
        res.json(result);
      } else {
        Exercise.create({ username }, (err, data) => {
          if (err) {
            res.status(500).json({ error: "Error while Creating User" });
          } else {
            const { _id } = data;
            const result = { _id, username };
            res.json(result);
          }
        });
      }
    }

  })

})

/* 
I can add an exercise to any user by posting form data userId(_id), description, duration, and optionally date to /api/exercise/add.
If no date supplied it will use current date. Returned will the the user object with also with the exercise fields added.
*/
router.post('/add', function (req, res) {
  console.log(' Adding Exercise Log ', req.body);
  const { userId, description, duration, date } = req.body
  let log = { description, duration };
  if (date) {
    log.date = new Date(date);
  }
  const query = getUserQuery(userId);

  Exercise.findOne(query, (err, exercise) => {
    if (err) {
      console.log(' Error ', err);
      res.status(500).json({ error: "Error while Finding User" });
    } else {
      exercise.log.push(log);
      exercise.save((err, exercise) => {
        if (err) {
          res.status(500).json({ error: "Error while Saving Logs" });
        } else {
          res.json(exercise);
        }
      });
    }
  });
})

module.exports = router