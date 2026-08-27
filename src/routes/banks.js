import express from 'express';
import mongoose from 'mongoose';
import { Bank, validateBank, validateBankUpdate } from '../models/Bank.js';
import auth from '../middleware/auth.js';

const routes = express.Router();
routes.use(auth);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

routes.post('/', async (req, res) => {
  const { error } = validateBank(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const bank = new Bank(req.body);
  const savedBank = await bank.save();
  return res.status(201).send(savedBank);
});

routes.get('/', async (req, res) => {
  const banks = await Bank.find().sort({ name: 1 });
  return res.send(banks);
});

routes.get('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid bank id');

  const bank = await Bank.findById(req.params.id);
  if (!bank) return res.status(404).send('Bank not found');

  return res.send(bank);
});

routes.put('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid bank id');

  const { error } = validateBankUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const bank = await Bank.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bank) return res.status(404).send('Bank not found');

  return res.send(bank);
});

routes.delete('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid bank id');

  const bank = await Bank.findByIdAndDelete(req.params.id);
  if (!bank) return res.status(404).send('Bank not found');

  return res.send(bank);
});

export default routes;
