import express from 'express';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import { User, validateUser } from '../models/user.js';
import auth from '../middleware/auth.js';

const routes = express.Router();

routes.post('/', async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User Already registered');

    user = new User(_.pick(req.body, ['name', 'email', 'password']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    try {
        const saved_user = await user.save();
        const token = user.generateAuthToken();
        res.header('x-auth-token', token).send(_.pick(user, ['name', 'email', '_id']));
    } catch (err) {
        res.status(500).send(err.message);
    }
});

routes.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

export default routes;
