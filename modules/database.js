const mysql = require('promise-mysql');

var pool = mysql.createPool({
    host: 'aa11kbqrhpc77vp.cjdio7be0ee3.ap-northeast-2.rds.amazonaws.com',
    user: 'payot',
    password: 'Vpdldhxl2017',
    database: 'Poin'
});

module.exports = pool;
