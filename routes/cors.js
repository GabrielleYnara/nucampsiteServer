const cors = require('cors');

const whitelist = ['http://localhost:3000', 'http://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if (whitelist.indexOf(req.header('Origin')) !==-1) { // checks if Origin can be found in the while list, if it's not -1 means it was found
        corsOptions = {origin: true};
    } else {
        corsOptions = {origin: false};
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);