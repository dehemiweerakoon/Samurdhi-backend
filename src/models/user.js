import Joi from 'joi';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import config from 'config';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
  },
  isAdmin: Boolean,
});

userSchema.methods.generateAuthToken = function () {
  const jwtPrivateKey = process.env.JWT_PRIVATE_KEY || config.get('jwtPrivateKey');
  if (!jwtPrivateKey) {
    throw new Error('JWT_PRIVATE_KEY is not configured');
  }

  const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, jwtPrivateKey);
  return token;
};

export const User = mongoose.model('User', userSchema);

export const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(user);
};

export const validateAuth = (req) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(req);
};
