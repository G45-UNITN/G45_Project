const mongoose = require(`mongoose`);

const Schema = mongoose.Schema;

const BudgetSchema = new Schema({
    userID: String,
    name: String,
    current: Number,
    amount: Number,
    createdAt: Date,
    description: String,

});

const Budget = mongoose.model(`Budget`, BudgetSchema);

module.exports = Budget;
