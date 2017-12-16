'use strict';

module.exports = {
    jwtSecretKey: '098ujh4d-gfty-89iu-nmjk-09877667hgh5',
    jwtExpiresIn: '24y',
    webPort: 3000,
    pg: {
        user: 'rolladb',
        database: 'rolla',
        password: 'RoLL@1@#$',
        host: '34.231.6.39',
        port: 5432,
        max: 10,
        idleTimeoutMillis: 30000

    },
    redis: {
        host: '127.0.0.1',
        port: 6379,
        db: 'db0'
    },
    certificates: {
        cert: "pro_certi.pem",
        key: "pro_key.pem",
        apnKey: "APNsAuthKey_Q4Y6U4SL7V.p8"
    }
};