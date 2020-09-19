const jwt = require('jsonwebtoken');

const ServerVer = {
    _Major: 7,
    _Minor: 17,
    _Build: 6,
    _Revision: 0
};

function extractToken(req, res, next) {
    let auth = req.header('Authorization').split(' ');
    if (auth.length == 2 && auth[0] == "bearer") {
        req.jwt = jwt.decode(auth[1]); // I'm not going to verify the token
        next && next();
        return;
    }
    res.status(401).end();
    next && next('invalid auth token');
}

module.exports = {
    extractToken,
    ServerVer,
};
