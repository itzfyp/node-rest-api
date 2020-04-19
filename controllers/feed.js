const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator/check');
const Post = require('../models/post');
const User = require('../models/user');
const { setexJson, deleteKeysWithPattern } = require('../core/cache');

exports.getPosts = (req, res, next) => {

    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;

    Post.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find().skip((currentPage - 1) * perPage).limit(perPage);
        })
        .then(posts => {
            const response = { message: 'fetched Posts successfully', posts, totalItems };
            setexJson(req.userId + ":" + req.originalUrl, response);
            res.status(200).json(response);
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

};

exports.createPost = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('validataion failed. entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const imageUrl = req.file.path.replace("\\", "/");
    const title = req.body.title;
    const content = req.body.content;
    let creator;

    const post = new Post({
        title,
        content,
        imageUrl,
        creator: req.userId
    });

    post.save()
        .then(() => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.posts.push(post);
            return user.save();
        })
        .then(result => {
            deleteKeysWithPattern('/feed/posts*');
            res.status(201).json({
                message: 'Post creates successfully',
                post: post,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
            });

        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};


exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }
            const response = { message: 'Post fetched', post };
            setexJson(req.userId + ":" + req.originalUrl, response);
            res.status(200).json(response);
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};


exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('validataion failed. entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }

    if (!imageUrl) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not autherized');
                error.statusCode = 403;
                throw error;
            }
            if (imageUrl !== post.imageUrl)
                clearImage(post.imageUrl);
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            return post.save();
        })
        .then(result => {
            deleteKeysWithPattern('/feed/posts*');
            res.status(200).json({ message: 'post updated', post: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

};


exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not autherized');
                error.statusCode = 403;
                throw error;
            }

            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId);
        })
        .then(() => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
        })
        .then(result => {
            console.log(result);
            deleteKeysWithPattern('/feed/posts*');
            res.status(200).json({ message: 'post deleted successfully' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });

};

const clearImage = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};