var mysql= require("mysql");

var connection= mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234'
});

module.exports= connection;