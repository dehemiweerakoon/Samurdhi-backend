import express from 'express';
import bcrypt from 'bcrypt';
import { User, validateAuth } from '../models/user.js';

const routes = express.Router();

routes.post('/', async (req, res) => {
    const { error } = validateAuth(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid User or password');

    const result = await bcrypt.compare(req.body.password, user.password);
    if (!result) return res.status(400).send('Invalid User or password');

    const token = user.generateAuthToken();
    res.send(token);
});

export default routes;
