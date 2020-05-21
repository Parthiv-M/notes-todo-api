const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true, useUnifiedTopology: true}, (err, db) => {
    if(err) {
        console.log('Unable to connect to MongoDB server!');
    }

    console.log('Connected to MongoDB server!');

    var dbase = db.db('TodoApp');
    
    //DELETE ONE
    dbase.collection('Todos').deleteOne({
      text: 'Something to do'  
    }).then((result) => {
        console.log(result);
    });

    //DELETE MANY
    // dbase.collection('Todos').deleteMany({
    //     text: 'Something to do'
    // }).then((result) => {
    //     console.log(result);
    // });

    //FIND ONE AND DELETE
    // dbase.collection('Todos').findOneAndDelete({
    //     completed: false
    // }).then((result) => {
    //     console.log(result);
    // });
});