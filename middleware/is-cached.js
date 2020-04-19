const { getJson } = require('../core/cache');

module.exports = (req, res, next) => {

    const key = req.userId + ":" + req.originalUrl;
    getJson(key, (error, cachedData) => {
        if (error) throw error;
        if (cachedData != null) {
            res.status(200).json(cachedData);
        } else {
            next();
        }
    });
};