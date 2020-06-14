var mongoose = require('mongoose');

mongoose.Promise = global.Promise;  //sets built in promises in mongoose as default promises to be used
mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true});

module.exports = {
    mongoose
};