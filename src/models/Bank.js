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
  },
  overdueLoanQty: {
    type: Number,
    required: false,
    min: 0,
  },
  InactiveLoanAmount: {
    type: Number,
    required: false,
    min: 0,
  },
  InactiveLoanQty: {
    type: Number,
    required: false,
    min: 0,
  },
  customColumns: {
    type: [{
      name: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 50,
      },
      dataType: {
        type: String,
        enum: ['string', 'number', 'boolean', 'date'],
        required: true,
      },
    }],
    default: [],
  },
  customData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {},
  },
  customDocuments: {
    type: [{
      columnName: { type: String, required: true },
      filename: { type: String, required: true },
      mimetype: { type: String, required: true, enum: ['application/pdf'] },
      size: { type: Number, required: true },
      data: { type: Buffer, required: true },
    }],
    default: [],
  },
});

export const Bank = mongoose.model('Bank', bankSchema);

export const validateBank = (bank) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(5000).required(),
    overdueLoanAmount: Joi.number().min(0).max(1000000000),
    overdueLoanQty: Joi.number().integer().min(0).max(1000000000),
    InactiveLoanAmount: Joi.number().min(0).max(1000000000),
    InactiveLoanQty: Joi.number().integer().min(0).max(1000000000),
    customData: Joi.object().unknown(true),
  });
  return schema.validate(bank);
};

export const validateBankUpdate = (bank) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(5000),
    overdueLoanAmount: Joi.number().min(0).max(1000000000),
    overdueLoanQty: Joi.number().integer().min(0).max(1000000000),
    InactiveLoanAmount: Joi.number().min(0).max(1000000000),
    InactiveLoanQty: Joi.number().integer().min(0).max(1000000000),
    customData: Joi.object().unknown(true),
  }).min(1);
  return schema.validate(bank);
};

export const validateBankColumns = (columns) => {
  const schema = Joi.object()
    .pattern(
      Joi.string().pattern(/^[A-Za-z][A-Za-z0-9_]*$/).max(50),
      Joi.string().valid('string', 'number', 'boolean', 'date', 'document')
    )
    .min(1)
    .required();
  return schema.validate(columns);
};

export { bankSchema };
