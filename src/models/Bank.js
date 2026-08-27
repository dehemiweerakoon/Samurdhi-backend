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
    name: Joi.string().min(5).max(50).required(),
    overdueLoanAmount: Joi.number().min(0).max(255),
    overdueLoanQty: Joi.number().integer().min(0).max(255),
    InactiveLoanAmount: Joi.number().min(0).max(255),
    InactiveLoanQty: Joi.number().integer().min(0).max(255),
  });
  return schema.validate(bank);
};

export const validateBankUpdate = (bank) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50),
    overdueLoanAmount: Joi.number().min(0).max(255),
    overdueLoanQty: Joi.number().integer().min(0).max(255),
    InactiveLoanAmount: Joi.number().min(0).max(255),
    InactiveLoanQty: Joi.number().integer().min(0).max(255),
  }).min(1);
  return schema.validate(bank);
};

export { bankSchema };
