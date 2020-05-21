const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
    if(err) {
        console.log('Unable to connect to MongoDB server!');
    }

    console.log('Connected to MongoDB server!');

    var dbase = db.db('TodoApp');
    
    dbase.collection('Todos').findOneAndUpdate({
        _id: new ObjectID('5ec378d148512f14ea1a6123')
    }, {
        $set: {
            completed: true
        }
    }, {
        returnOriginal: false   //return the updated document instead of original one
    }).then((result) => {
        console.log(result);
    });

    dbase.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5ec39ab6ae7fd81c4e6eb0a4')
    }, {
        $inc: {
            'user.age': 1
        }
    }, {
        returnOriginal: false
    }).then((result) => {
        console.log(result);
    })
});