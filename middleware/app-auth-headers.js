module.exports = (req, res, next) => {
    res.setHeader('Access-Control-Allow-origin', '*');
    res.setHeader('Access-control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
};