import Joi from 'joi';
import mongoose from 'mongoose';

const bankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  overdueLoanAmount: {
    type: Number,
    required: false,
    min: 0,
    max: 255,
  },
  overdueLoanQty: {
    type: Number,
    required: false,
    min: 0,
    max: 255,
  },
  InactiveLoanAmount: {
    type: Number,
    required: false,
    min: 0,
    max: 255,
  },
  InactiveLoanQty: {
    type: Number,
    required: false,
    min: 0,
    max: 255,
  },
});

export const Bank = mongoose.model('Bank', bankSchema);

export const validateBank = (bank) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });
  return schema.validate(bank);
};

export { bankSchema };
