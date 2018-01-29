var mysql = require('mysql');

var pool;

exports.connect = function(done){
  pool = mysql.createPool({
    connectionLimit : 100,
    host            : 'localhost',
    user            : 'test',
    password        : '123',
    database        : 'Happy'
  });
}

exports.get = function() {
  return pool;
}
