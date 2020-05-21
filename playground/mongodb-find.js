//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
      }
    console.log('Connected to MongoDB server');

    var dbase = db.db('TodoApp');

    // dbase.collection('Todos').find({
    //   _id: new ObjectID('5ec36ee5f09da510537d4ef5')
    // }).toArray().then((docs) => {
    //   console.log('Todos');
    //   console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //   console.log('Unable to fetch todos', err);
    //   db.close();
    // });

    dbase.collection('Todos').find().count().then((count) => {
        console.log('Todos count: ' + count);
    });
    db.close();
});