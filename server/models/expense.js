const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  description: { type: String, trim: true },
  date: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);