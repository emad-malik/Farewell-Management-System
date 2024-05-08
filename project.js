const express = require('express');
const mysql = require('mysql');
const path = require('path'); 
const app = express();
const port = 8080;
const connection = require('./database');
const bodyParser = require('body-parser');
const session = require('express-session');
// Session middleware setup
app.use(session({
    secret: 'mySystem', 
    resave: false,
    saveUninitialized: false, 
    cookie: { secure: false } 
}));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to database
connection.connect(function(err) {
    if (err) {
        console.error("Error connecting to the database: ", err);
        return;
    }
    console.log("Database Connected!");

    // Create a database named FarewellMS
    connection.query("CREATE DATABASE IF NOT EXISTS FarewellMS", function (err) {
        if (err) {
            console.error("Error creating database: ", err);
            return;
        }
        console.log("FarewellMS Database Created");

        // Switch to the new database
        connection.changeUser({database : 'FarewellMS'}, function(err) {
            if (err) {
                console.error("Error switching databases: ", err);
                return;
            }

            // Create the SystemUser table
            const createUserTable = `CREATE TABLE IF NOT EXISTS SystemUser (
                UserID INT AUTO_INCREMENT PRIMARY KEY,
                Username VARCHAR(255) NOT NULL,
                Password VARCHAR(255) NOT NULL,
                EmailID VARCHAR(255) NOT NULL,
                ContactNumber VARCHAR(25),
                Type ENUM('Student', 'Teacher') NOT NULL
            )`;
            connection.query(createUserTable, function (err) {
                if (err) {
                    console.error("Error creating User table: ", err);
                    return;
                }
                console.log("User Table created");

                // Create the UserRegistrationLog table
                const createUserLogTable = `
                    CREATE TABLE IF NOT EXISTS UserRegistrationLog (
                        LogID INT AUTO_INCREMENT PRIMARY KEY,
                        UserID INT NOT NULL,
                        RegistrationDate DATETIME NOT NULL,
                        FOREIGN KEY (UserID) REFERENCES SystemUser(UserID)
                    )`;
                connection.query(createUserLogTable, function (err) {
                    if (err) {
                        console.error("Error creating User Registration Log table: ", err);
                        return;
                    }
                    console.log("User Registration Log Table created");

                // Create the Students table
                const createStudentsTable = `
                        CREATE TABLE IF NOT EXISTS Students (
                        StudentID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                        StuFamilyMembers INT,
                        DietaryPreference ENUM('Vegan', 'Non-Vegan') NOT NULL,
                        StudentRole VARCHAR(255) NOT NULL,
                        UserID INT,
                        FOREIGN KEY (UserID) REFERENCES SystemUser(UserID)
                    )`;
                connection.query(createStudentsTable, function (err) {
                    if (err) {
                        console.error("Error creating Students table: ", err);
                        return;
                    }
                    console.log("Students Table created");
                });
                
                // Create the Teachers table
                const createTeachersTable = `
                    CREATE TABLE IF NOT EXISTS Teachers (
                    TeacherID INT AUTO_INCREMENT PRIMARY KEY,
                    TeFamilyMembers INT,
                    UserID INT,
                    FOREIGN KEY (UserID) REFERENCES SystemUser(UserID)
                )`;
                connection.query(createTeachersTable, function (err) {
                if (err) {
                    console.error("Error creating Teachers table: ", err);
                    return;
                }
                console.log("Teachers Table created");
                });

                // Create the Menu table
                const createMenuTable = `
                        CREATE TABLE IF NOT EXISTS MenuItems (
                        ItemID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                        ItemName VARCHAR(225) NOT NULL UNIQUE,  
                        BudgetAllocated INT
                    )`;
                connection.query(createMenuTable, function (err) {
                    if (err) {
                        console.error("Error creating MenuItems table: ", err);
                        return;
                    }
                    console.log("MenuItems Table created");
                });

                // Create the Performance table
                const createPerfTable = `
                        CREATE TABLE IF NOT EXISTS Performance (
                        PerformanceID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                        Title VARCHAR(225) NOT NULL UNIQUE,  
                        Duration TIME,
                        Special_Requirements VARCHAR(225),
                        PerformanceStatus ENUM('Proposed', 'Accepted') NOT NULL,
                        StudentID INT NOT NULL,  
                        FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
                        
                    )`;
                connection.query(createPerfTable, function (err) {
                    if (err) {
                        console.error("Error creating Performance table: ", err);
                        return;
                    }
                    console.log("Performance Table created");
                });

                 // Create the Suggestion table
                 const createSuggestionTable = `
                    CREATE TABLE IF NOT EXISTS StudentSuggestion (
                    StudentID INT NOT NULL,
                    ItemID INT NOT NULL,
                    PRIMARY KEY (StudentID, ItemID),
                    FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
                    FOREIGN KEY (ItemID) REFERENCES MenuItems(ItemID)
                 
             )`;
         connection.query(createSuggestionTable, function (err) {
             if (err) {
                 console.error("Error creating StudentSuggestion table: ", err);
                 return;
             }
             console.log("StudentSuggestion Table created");
         });


                    // Define the user_logging trigger
                    // const createUserLoggingTrigger = `
                    //     CREATE TRIGGER user_logging
                    //     AFTER INSERT ON SystemUser
                    //     FOR EACH ROW
                    //     BEGIN
                    //         INSERT INTO UserRegistrationLog(UserID, RegistrationDate)
                    //         VALUES (NEW.UserID, NOW());
                    //     END;
                    //     `;
                    // connection.query(createUserLoggingTrigger, function (err) {
                    // if (err) {
                    //     console.error("Error creating trigger: ", err);
                    //     return;
                    // }
                    // console.log("Trigger for logging created successfully");
                    // });

                });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Open register page for client
app.get('/register', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/register.html'));
});

// Endpoint to handle register form submission
app.post('/register_user', function(req, res) {
    const { username, password, email, contactNumber, type, role } = req.body;

    const insertUserQuery = `INSERT INTO SystemUser (Username, Password, EmailID, ContactNumber, Type) VALUES (?, ?, ?, ?, ?)`;
    connection.query(insertUserQuery, [username, password, email, contactNumber, type], function(err, result) {
        if (err) {
            console.error('Failed to insert new user:', err);
            res.status(500).send("Error registering new user.");
            return;
        }
        console.log("New user registered successfully!");

        // if type is student
        if (type === 'Student' && role) 
            { 
            const studentRoleQuery = `INSERT INTO Students (UserID, StudentRole) VALUES (?, ?)`;
            connection.query(studentRoleQuery, [result.insertId, role], function(err) {
                if (err) {
                    console.error('Failed to insert student role:', err);
                    res.status(500).send("Error registering student role.");
                    return;
                }
                console.log("Student role added!");
                res.send("Registration successful!");
            });
        } 
        // if type is teacher
        else if(type === 'Teacher')
        { 
            const teacherInsertQuery = `INSERT INTO Teachers (UserID) VALUES (?)`;
            connection.query(teacherInsertQuery, [result.insertId], function(err) {
                if (err) {
                    console.error('Failed to insert teacher details:', err);
                    res.status(500).send("Error registering teacher details.");
                    return;
                }
                console.log("Teacher details added!");
                res.send("Registration successful!");
            });
        }
    });
});


// Open login page for client(student)
app.get('/stlogin', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/studentlogin.html'));
});

// Endpoint to handle student login form submission
app.post('/student_login', function(req, res) {
    const { username, password } = req.body;
    const auth_query = "SELECT * FROM SystemUser WHERE Username = ? AND Password = ? AND Type = 'Student'";

    connection.query(auth_query, [username, password], function(err, results) {
        if (err) {
            console.error('Database error during login:', err);
            return res.status(500).send("Internal server error");
        }
        
        if (results.length > 0) {
            req.session.studentID = results[0].UserID; 
            console.log("Student Authorized!");
            console.log("Session StudentID set:", req.session.studentID);
            res.redirect('/homepage');
        } else {
            console.log("Authentication failed. Check username/password.");
            res.status(401).send("Invalid username or password");
        }
    });
});

// Open login form for client(teacher)
app.get('/telogin', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/teacherlogin.html')); 
});

// Endpoint to handle teacher login
app.post('/teacher_login', function(req, res) {
    const { username, password } = req.body;
    const authQuery = "SELECT * FROM SystemUser WHERE Username = ? AND Password = ? AND Type = 'Teacher'";

    connection.query(authQuery, [username, password], function(err, results) {
        if (err) {
            console.error('Database error during teacher login:', err);
            return res.status(500).send("Internal server error");
        }
        
        if (results.length > 0) {
            // login successful
            console.log("Teacher authorized!");
            res.send("Login successful!");
        } else {
            // authentication failed
            console.log("Authentication failed. Check username/password.");
            res.status(401).send("Invalid username or password");
        }
    });
});

// Open main home page for client(student)
app.get('/homepage', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/student_dashboard.html'));
});


// Open menu page for client(student)
app.get('/food_selection', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/menu.html'));
});


app.post('/submit_vote', function(req, res) {
    const studentID = req.session.studentID; 
    const items = req.body.itemID;

    // Handle single and multiple item submissions
    const itemIDs = Array.isArray(items) ? items : [items];

    itemIDs.forEach((itemID) => {
        const studentFoodVote = 'INSERT INTO StudentSuggestions (StudentID, ItemID) VALUES (?, ?)';
        connection.query(studentFoodVote, [studentID, itemID], function(err, result) {
            if (err) {
                console.error('Failed to insert vote:', err);
                return res.status(500).send("Error processing your vote.");
            }
        });
    });

    res.send("Vote successfully recorded!");
});
