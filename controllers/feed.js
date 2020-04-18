exports.getPosts = (req, res, next) => {
    res.json({})
};

exports.createPost = (req, res, next) => {

    const title = req.body.title;
    const content = req.body.content;

    res.status(201).json({
        message: 'Post creates successfully',
        post: {
            id: new Date(),
            title,
            content
        }
    })
};