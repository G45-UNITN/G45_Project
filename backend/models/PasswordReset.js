const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const PasswordResetScheme = new Schema({
    userID: String,
    resetString: String,
    createdAt: Date,
    expiredAt: Date,

});

const PassworsReset = mongoose.model(`PassworsReset`, PasswordResetScheme);

module.exports = PassworsReset;
