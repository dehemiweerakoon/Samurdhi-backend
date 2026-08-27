import express from 'express';
import user from '../routes/user.js';
import auth from '../routes/auth.js';
import error from '../middleware/error.js';

export default function (app) {
    app.use(express.json());
    app.use('/api/user', user);
    app.use('/api/auth', auth);
    app.use(error);
}
