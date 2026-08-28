import express from 'express';
import mongoose from 'mongoose';
import { Bank, validateBank, validateBankUpdate, validateBankColumns } from '../models/Bank.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import multer from 'multer';

const routes = express.Router();
routes.use(auth);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== 'application/pdf') return callback(new Error('Only PDF files are allowed'));
    callback(null, true);
  },
});

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const reservedColumnNames = new Set([
  '_id',
  'name',
  'overdueLoanAmount',
  'overdueLoanQty',
  'inactiveLoanAmount',
  'inactiveLoanQty',
  'customColumns',
  'customData',
  'customDocuments',
]);

const valueMatchesType = (value, dataType) => {
  if (dataType === 'string') return typeof value === 'string';
  if (dataType === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (dataType === 'boolean') return typeof value === 'boolean';
  if (dataType === 'date') return typeof value === 'string' && !Number.isNaN(Date.parse(value));
  if (dataType === 'document') return false;
  return false;
};

const bankResponse = (bank) => {
  const result = bank.toObject ? bank.toObject() : bank;
  result.customDocuments = (result.customDocuments || []).map(({ data, ...document }) => document);
  return result;
};

routes.post('/', async (req, res) => {
  const { error } = validateBank(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const bank = new Bank(req.body);
  const savedBank = await bank.save();
  return res.status(201).send(savedBank);
});

routes.post('/:id/columns', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid bank id');

  const { error } = validateBankColumns(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const bank = await Bank.findById(req.params.id);
  if (!bank) return res.status(404).send('Bank not found');

  const existingNames = new Set([
    ...reservedColumnNames,
    ...bank.customColumns.map((column) => column.name.toLowerCase()),
  ]);
  const requestedNames = Object.keys(req.body);
  const duplicateName = requestedNames.find((name) => existingNames.has(name.toLowerCase()));
  if (duplicateName) {
    return res.status(409).send(`Bank column '${duplicateName}' already exists`);
  }

  bank.customColumns.push(
    ...requestedNames.map((name) => ({
      name,
      dataType: req.body[name],
    }))
  );
  await bank.save();

  return res.status(201).send(bankResponse(bank));
});

routes.post('/:id/documents/:columnName', upload.single('file'), async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid bank id');
  if (!req.file) return res.status(400).send('A PDF file is required');

  const bank = await Bank.findById(req.params.id);
  if (!bank) return res.status(404).send('Bank not found');
  const column = bank.customColumns.find(({ name }) => name === req.params.columnName);
  if (!column || column.dataType !== 'document') {
    return res.status(400).send('The bank column must have document type');
  }

  bank.customDocuments = bank.customDocuments.filter(({ columnName }) => columnName !== column.name);
  bank.customDocuments.push({
    columnName: column.name,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    data: req.file.buffer,
  });
  await bank.save();
  return res.status(201).send({
    columnName: column.name,
    filename: req.file.originalname,
    size: req.file.size,
    url: `/api/banks/${bank._id}/documents/${encodeURIComponent(column.name)}`,
  });
});

routes.get('/:id/documents/:columnName', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid bank id');
  const bank = await Bank.findById(req.params.id);
  if (!bank) return res.status(404).send('Bank not found');
  const document = bank.customDocuments.find(({ columnName }) => columnName === req.params.columnName);
  if (!document) return res.status(404).send('Document not found');

  res.type(document.mimetype);
  res.setHeader('Content-Disposition', `inline; filename="${document.filename.replace(/["\r\n]/g, '')}"`);
  return res.send(document.data);
});

routes.get('/', async (req, res) => {
  const banks = await Bank.find().sort({ name: 1 });
  return res.send(banks.map(bankResponse));
});

routes.get('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid bank id');

  const bank = await Bank.findById(req.params.id);
  if (!bank) return res.status(404).send('Bank not found');

  return res.send(bankResponse(bank));
});

routes.put('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid bank id');

  const { error } = validateBankUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const bank = await Bank.findById(req.params.id);
  if (!bank) return res.status(404).send('Bank not found');

  if (req.body.customData) {
    const columnsByName = new Map(bank.customColumns.map((column) => [column.name, column.dataType]));
    const invalidField = Object.entries(req.body.customData)
      .find(([name, value]) => !columnsByName.has(name) || !valueMatchesType(value, columnsByName.get(name)));
    if (invalidField) {
      return res.status(400).send(`Invalid value for custom bank column '${invalidField[0]}'`);
    }
    bank.customData = new Map(Object.entries(req.body.customData));
  }

  Object.entries(req.body)
    .filter(([key]) => key !== 'customData')
    .forEach(([key, value]) => { bank[key] = value; });
  await bank.save();
  return res.send(bankResponse(bank));
});

routes.delete('/:id', admin, async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(400).send('Invalid bank id');

  const bank = await Bank.findByIdAndDelete(req.params.id);
  if (!bank) return res.status(404).send('Bank not found');

  return res.send(bankResponse(bank));
});

export default routes;
