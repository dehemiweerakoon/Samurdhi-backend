import express from 'express';
import mongoose from 'mongoose';
import { Sector, validateSector, validateSectorUpdate } from '../models/Sector.js';
import auth from '../middleware/auth.js';

const routes = express.Router();
routes.use(auth);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

routes.post('/', async (req, res) => {
  const { error } = validateSector(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const sector = await Sector.create(req.body);
  await sector.populate('bank', 'name');
  return res.status(201).send(sector);
});

routes.get('/', async (req, res) => {
  const sectors = await Sector.find().populate('bank', 'name').sort({ name: 1 });
  return res.send(sectors);
});

routes.get('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid sector id');

  const sector = await Sector.findById(req.params.id).populate('bank', 'name');
  if (!sector) return res.status(404).send('Sector not found');

  return res.send(sector);
});

routes.put('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid sector id');

  const { error } = validateSectorUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const sector = await Sector.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('bank', 'name');
  if (!sector) return res.status(404).send('Sector not found');

  return res.send(sector);
});

routes.delete('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid sector id');

  const sector = await Sector.findByIdAndDelete(req.params.id);
  if (!sector) return res.status(404).send('Sector not found');

  return res.send(sector);
});

export default routes;
