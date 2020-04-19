const { validationResult } = require('express-validator/check');
const bCrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { deleteKeysWithPattern } = require('../core/cache');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('validataion failed.');
        error.statusCode = 422;
        error.data = errors.array()
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bCrypt.hash(password, 12)
        .then(hashedPass => {
            const user = new User({
                email,
                password: hashedPass,
                name
            });

            return user.save();
        })
        .then(result => {
            res.status(200).json({
                message: 'User created',
                userId: result._id
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });


};


exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loaderUser;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                const error = new Error('Could not find User');
                error.statusCode = 401;
                throw error;
            }

            loaderUser = user;

            return bCrypt.compare(password, user.password);

        })
        .then(isEqul => {
            if (!isEqul) {
                const error = new Error('wrong password');
                error.statusCode = 401;
                throw error;
            }

            deleteKeysWithPattern(`${loaderUser._id.toString()}*`);

            const token = jwt.sign(
                {
                    email: loaderUser.email,
                    userId: loaderUser._id.toString()
                },
                'secretPrivateSignature',
                { expiresIn: '1h' }
            );

            res.status(200).json({ token, userId: loaderUser._id.toString() });

        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
};