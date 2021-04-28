const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail} = require('./emails/account')
const {sendGoodbyeEmail} = require('./emails/account')

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

const upload = multer({         // instance of multer is created with following speciofications
                                // since we need the image saved in the user profile and not the file system
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){       //checks for file ending using regular expressions
      return cb(new Error('Please check the file type (jpg, jpeg, png) and file size (less than 1 MB)'))
    }
    cb(undefined, true)
  }
})

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id,
  });
  console.log('saving...');

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

//GET /todos?completed=true
//GET /todos?limit=5&&skip=20

// fetches all todos
app.get('/todos', authenticate, async (req, res) => {
  var myTodos = []; 
  const match = {}
  const sort = {}

  if(req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1   // assigns 1 or -1 depending on asc or desc
  }

  if(req.query.completed === 'all') {
    Todo
    .find()
    .limit(parseInt(req.query.limit))   // pagination worked like this for me :)
    .skip(parseInt(req.query.skip))
    .sort(
      sort
    )    
    .populate({
      path: 'creator',         // populates the _creator field
      match: {
        _id: req.user._id       // checks if it is the current user
      },      
    })
    .exec((err, doc) => {
      doc.forEach((todo) => {
        if(todo._creator !== null){
          myTodos.push(todo)     
        }
      })
      res.send(myTodos)
    })  
  }

  else if(req.query.completed) {
    match.completed = req.query.completed === 'true'

   Todo
    .find({ completed: match })    // checks if the todo is completed
    .limit(parseInt(req.query.limit))   // pagination worked like this for me 
    .skip(parseInt(req.query.skip))
    .sort(
      sort
    )
    .populate({
      path: '_creator',         // populates the _creator field
      match: {
        _id: req.user._id       // checks if it is the current user
      }
    })
    .exec((err, doc) => {
      doc.forEach((todo) => {
        if(todo._creator !== null){
          myTodos.push(todo)     
          }
        })
      res.send(myTodos)
    })
  }
  
    // result : the _creator field is getting populated correctly
    // in postman, GET /todos returns the required todos
    // error : when the match property fails (todo is of other user), the _creator field is set to null
    // temporary fix : checked if _creator is null or not and display corresponding todos  
});

// fetches todos by ID
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

// deletes todo by ID
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

// updates a todo by ID
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

// creates a new user
app.post('/users', (req, res) => {      
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    sendWelcomeEmail(user.email, user.name)
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token);
    console.log(user);
    res.send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

// fetches all users
app.get('/users', (req, res) => {        
    console.log('in get /users');
    User.findOne({
        email: "parthivmenon.dev@gmail.com"
    }).then((user) => {
        console.log('sending user info...');
        console.log(user);
        res.send(user);
    }).catch((e) => console.log(e));
});

// fetches user's profile
app.get('/users/me', authenticate, (req, res) => {
    console.log('in users/me');
    res.send(req.user);
});

// logs a user in
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

// updates user profile details
app.patch('/users/me', authenticate, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['email', 'password'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if(!isValidOperation){
    res.status().send({ error: 'Invalid Updation' });
  }

  try{
    updates.forEach((update) => req.user[update] = req.body[update]);
    await req.user.save()
    res.send(req.user);
  } catch(e) {
    res.status(400).send();
  }
});

// logs a user out
app.post('/users/logout', authenticate, async (req, res) => {

  //logs out of one particular session => api can be running on multiple devices and you can log out from one of them
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();

  } catch(e) {
    res.status(500).send()
  }
});

// logs user out from all sessions
app.post('/users/logoutAll', authenticate, async (req,res) => {
  try{
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch(e) {
    res.status(500).send();
  }
});

// deletes a user profile, only for self
app.delete('/users/me', authenticate, async (req, res) => {
  try{
    await req.user.remove()
    sendGoodbyeEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch(e) {
    res.status(500).send()
  }
}); 

// creates a user avatar
app.post('/users/me/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({height: 250, width: 250}).png().toBuffer()    //converts to required size and required format
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(404).send({ error: error.message})
})

// deletes user avatar
app.delete('/users/me/avatar', authenticate, async(req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

// fetches user avatar by ID
app.get('/users/:id/avatar', async (req, res) => {
  try{
    const user = await User.findById(req.params.id)

    if(!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)

  } catch(e) {
    res.status(404).send()
  }
})

// listen to the app on $port
app.listen(port, () => {
  console.log(`Started up at port ` + port);
});

module.exports = {
  app
};
