var mongoose = require('mongoose');
var express = require('express');

const person = new mongoose.Schema({
    name: {
        type: String,
    },
    age: {
        type: String
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }
});

const job = new mongoose.Schema({
    designation: {
        type: String
    },
    jobHolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Person'
    }
});

var Person = mongoose.model('Person', person);
var Job = mongoose.model('Job', job);

var mongoose = require('mongoose');
var app = express();

const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;  //sets built in promises in mongoose as default promises to be used
mongoose.connect('mongodb://localhost:27017/TestDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());

app.post('/test/person', (req, res) => {
    var per = new Person({
        name: req.body.name,
        age: req.body.age,
    });
    per.save().then((doc1) => {
        var myJob = new Job({
            designation: req.body.designation,
            jobHolder: per._id
        })
        myJob.save().then((doc2) => {
            console.log('doc2')
            console.log(doc2);
        })
        console.log('doc1')
        console.log(doc1);
    })     
    res.send('done')
})

app.post('/test/job', (req, res) => {
    var myJob = new Job({
        designation: req.body.designation
    })
    myJob.save().then((doc) => {
        res.send(doc);
    })
})


app.get('/test/person', (req, res) => {
    console.log('works');

    Job
      .find()
      .populate({
          path: 'jobHolder',
        //   match: {
        //       age: '31'
        //   }
      })
      .exec((err, doc) => {
          res.send(doc)
    })
})

app.get('/test/job', (req, res) => {
    console.log('works too');

    // Job
    //   .find()
    //   .populate({
    //       path: 'person',
    //       match: {

    //       }
    //   })
    //   .exec((err, doc) => res.send(doc));
})

app.listen(3000, () => {
    console.log('app started on port 3000');
})

