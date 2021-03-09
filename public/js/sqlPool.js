var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit :   10,
    host            :   'classmysql.engr.oregonstate.edu',
    user            :   'cs290_lannersn',
    password        :   '5K70UP3FZ0$X3PntW1wfJr',
    database        :   'cs290_lannersn'
});

module.exports.pool = pool;