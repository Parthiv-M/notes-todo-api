var mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: String,
        default: null
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

var Todo = mongoose.model('Todo', TodoSchema);

module.exports = {
    Todo
};