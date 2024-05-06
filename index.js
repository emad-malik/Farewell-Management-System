
// const express= require('express');// used for routing

// var mysql= require('mysql');

// const app = express();// instance of server is created
// const port = 8080;//run on this port
// const path = require('path');
// app.listen(port, function(){                          // connecting to a server
//     console.log(`Listening on port ${port}...`);  
// });

//     var connection = mysql.createConnection({  
//     host: "localhost",          
//     user: "root",  
//     password: "emad1234",
//     database: "northwind"                
// });

// connection.connect(function(err) {                // connecting to DBMS
//     if (err) throw err;  
//     console.log("Connected!");  
//        });

// app.get('/login', function(req, res) {
//     res.sendFile(path.join(__dirname, 'login.html'));
// });
// /*
// app.get('/index', function(req, res) {
//     res.sendFile(path.join(__dirname, 'index.html'));
// });
// */

// app.get('/xyz', function(req, res) {
//     res.send('Hi I am Shafay. I cannot find parking.');
// });

// app.get('/abc', function(req, res) {
//     res.send('This is Lab 11');
// });

// app.get('/query',function(req,res) {          // Request to create table Students in northwind database
//     let sql = "SELECT productName, unitPrice FROM products WHERE unitPrice BETWEEN 10 AND 20";
//     connection.query(sql,function(err,results){
//         if (err) throw err;  
//         res.send(results);
//     });
// });

// q1
// app.get('/query',function(req,res) {          // Request to create table Students in northwind database
//     let sql = "SELECT CategoryName, AVG(unitPrice) as AvgPrice FROM products JOIN Categories on products.categoryID = categories.CategoryID GROUP BY categories.CategoryName ORDER BY AvgPrice DESC LIMIT 5";
//     connection.query(sql,function(err,results){
//         if (err) throw err;  
//         res.send(results);
//     });
// });

// q2
// app.get('/query',function(req,res) {          // Request to create table Students in northwind database
//     let sql = "SELECT DISTINCT CompanyName, OrderDate FROM orders JOIN customers ON orders.CustomerID = customers.CustomerID WHERE YEAR(orders.OrderDate) = 1996 ORDER BY customers.CompanyName";
//     connection.query(sql,function(err,results){
//         if (err) throw err;  
//         res.send(results);
//     });
// });


// q3
// app.get('/query',function(req,res) {          // Request to create table Students in northwind database
//     let sql = "SELECT FirstName, LastName FROM employees WHERE LastName LIKE 'S%' ORDER BY LastName, FirstName";
//     connection.query(sql,function(err,results){
//         if (err) throw err;  
//         res.send(results);
//     });
// });



// q4
// app.get('/query',function(req,res) {          // Request to create table Students in northwind database
//     let sql = "SELECT prod.ProductName, supp.CompanyName as SupplierName, supp.ContactName, supp.ContactTitle, supp.Phone FROM Products prod JOIN suppliers supp ON prod.SupplierID = supp.SupplierID WHERE prod.Discontinued = 1";
//     connection.query(sql,function(err,results){
//         if (err) throw err;  
//         res.send(results);
//     });
// });



const express = require('express'); // used for routing
const path = require('path');
const mysql = require('mysql');

const app = express(); // instance of server is created
const port = 8080; // run on this port

app.use(express.static(__dirname + '/public'));

app.listen(port, function() { // connecting to a server
    console.log(`Listening on port ${port}...`);
});

app.get('/homepg', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});





// Endpoint to handle form submission
app.post('/register_user', function(req, res) {
    const { username, password, email, contactNumber, type } = req.body;
    const insertQuery = `INSERT INTO SystemUser (Username, Password, EmailID, ContactNumber, Type) VALUES (?, ?, ?, ?, ?)`;

    connection.query(insertQuery, [username, password, email, contactNumber, type], function(err, result) {
        if (err) {
            console.error('Failed to insert new user: ', err);
            res.status(500).send("Error registering new user.");
            return;
        }
        console.log("New user registered successfully!");
        res.send("Registration successful!");
    });
});
