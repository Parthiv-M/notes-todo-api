//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp',  { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  var dbase = db.db('TodoApp');

  dbase.collection('Todos').insertOne({
    text: 'Write',
    completed: false
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert todo', err);
    }
    console.log('Collection Created!');
    console.log(JSON.stringify(result.ops, undefined, 2));
    db.close();
  });

  var user = {
    name: 'Shravya',
    age: 18,
    location: 'India'
  }

  dbase.collection('Users').insertOne({
    user,
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert todo', err);
    }
    console.log('Collection Created!');
    console.log(JSON.stringify(result.ops, undefined, 2));
    db.close();
  });

});