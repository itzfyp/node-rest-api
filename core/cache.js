const redis = require("redis");

const REDIS_PORT = 6379; // default port of redis

const redisClient = redis.createClient(REDIS_PORT);


redisClient.on('connect', function (err, response) {
    if (err) {
        const error = new Error('There is a error in redis connect section');
        error.statusCode = 403;
        throw error;
    }

    console.log("Redis cache connection is established successfully", response);
});


redisClient.on('error', function (err) {
    const error = new Error('Error in establoshing Redis cache connection');
    error.statusCode = 403;
    throw error;

});

exports.client = redisClient;

exports.setexJson = (key, value, exp = 3600) => {
    const val = JSON.stringify(value || null);
    redisClient.setex("" + key, exp, val);
};

exports.getJson = (key = '', cb = () => { }) => {
    redisClient.get("" + key, (err, data = null) => {
        const parsedVal = JSON.parse(data);
        cb(err, parsedVal);
    });
};


exports.deleteKeysWithPattern = (patternOrKeyName) => {
    return new Promise((ressolve, reject) => {
        redisClient.keys(patternOrKeyName, (error, keys) => {
            if (error)
                reject(error);
            keys.forEach(key => {
                redisClient.del(key);
            });
            ressolve('keys are deleted');
        });
    });
}