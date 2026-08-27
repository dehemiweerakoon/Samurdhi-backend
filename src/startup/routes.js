import express from 'express';
import user from '../routes/user.js';
import auth from '../routes/auth.js';
import banks from '../routes/banks.js';
import sectors from '../routes/sectors.js';
import error from '../middleware/error.js';

export default function (app) {
    app.use(express.json());
    app.use('/api/user', user);
    app.use('/api/auth', auth);
    app.use('/api/banks', banks);
    app.use('/api/sectors', sectors);
    app.use(error);
}
