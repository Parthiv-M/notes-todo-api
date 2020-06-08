require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  console.log('saving...');

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});

// POST /users
app.post('/users', (req, res) => {      //--working
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token);
    console.log(user);
    res.send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/users', (req, res) => {        //--working
    console.log('in get /users');
    User.findOne({
        email: "parthivmenon.dev@gmail.com"
    }).then((user) => {
        console.log('sending user info...');
        console.log(user);
        res.send(user);
    }).catch((e) => console.log(e));
});

app.get('/users/me', authenticate, (req, res) => {
    console.log('in users/me');
    res.send(req.user);
});

app.post('/users/login', (req, res) => {                //--working
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    console.log('executing...');
    console.log(user);
    return user.generateAuthToken().then((token) => {
      console.log('done');
      res.setHeader('x-auth', token);
      res.send(user);
      console.log('done2');
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.use('/users/logout', authenticate, (req, res) => {
  try {
    console.log('here');
    req.user.tokens = req.user.tokens.filter((token) => {
      console.log(token.token, 'and', req.token);
      return token.token !== req.token;
    });
    console.log('here');
    req.user.save();
    console.log('here');

    res.send();
    console.log('here');
  } catch(e) {
    res.status(500).send()
  }
});

app.delete('/users/me/token', authenticate, (req, res) => {

  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
  console.log('deleted');
});

app.listen(port, () => {
  console.log(`Started up at port ` + port);
});

module.exports = {app};