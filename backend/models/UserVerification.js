const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const UserVerificationSchema = new Schema({
    userID: String,
    uniqueString: String,
    createdAt: Date,
    expiredAt: Date,

});

const UserVerification = mongoose.model(`UserVerification`, UserVerificationSchema);

module.exports = UserVerification;
