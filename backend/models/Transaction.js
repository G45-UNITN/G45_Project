const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
    budgetID: String,
    name: String,
    createdAt: Date,
    amount: Number,
    currentAmount: Number,
    description: String,

});

const Transaction = mongoose.model(`Transaction`, TransactionSchema);

module.exports = Transaction;
