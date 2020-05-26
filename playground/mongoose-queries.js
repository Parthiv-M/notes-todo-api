const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = "5eccb2f7401c730e9f0c95"; 
var uid = '5ec7738e7f6d9c0d7520f3c9';   

// if(!ObjectID.isValid(id)){                    //validating IDs
//     console.log('ID not valid');
// }

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos: ', todos);  
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo: ', todo);  
// });

User.findById(uid).then((user) => {
    console.log('User found!', user);
}).catch((e) => console.log(e));

// Todo.findById(id).then((todo) => {
//     if(!todo){
//         return console.log('ID not found!');
//     }
//     console.log('Todo by ID', todo);
// }).catch((e) => console.log(e));