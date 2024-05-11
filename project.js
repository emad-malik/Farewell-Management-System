const express = require('express');
const mysql = require('mysql');
const path = require('path'); 
const app = express();
const port = 8080;
const connection = require('./database');
const bodyParser = require('body-parser');
const session = require('express-session');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
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

                // Create the Venue table
                const createVenueTable = `
                    CREATE TABLE IF NOT EXISTS Venue (
                    VenueID int AUTO_INCREMENT primary key NOT NULL,
                    VenueName varchar(225) NOT NULL,
                    Address varchar(225) NOT NULL,
                    Capacity int NOT NULL
        )`;
        connection.query(createVenueTable, function (err) {
            if (err) {
                console.error("Error creating Venue table: ", err);
                return;
            }
            console.log("Venue Table created");
        });
        
            // Create the Events table
            const createEventsTable = `
                CREATE TABLE IF NOT EXISTS Events (
                EventID int AUTO_INCREMENT primary key NOT NULL,
                EventName varchar(225) NOT NULL,
                EventDate DATE NOT NULL,
                VenueID int ,
                FOREIGN KEY (VenueID) REFERENCES Venue(VenueID)
        )`;
        connection.query(createEventsTable, function (err) {
        if (err) {
            console.error("Error creating Events table: ", err);
            return;
        }
        console.log("Events Table created");
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
            // Create the Assignment table
            const createAssignmentTable = `
                CREATE TABLE IF NOT EXISTS TaskAssignment (
                TaskID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
                TaskDetails VARCHAR(255),
                AssignedBy INT NOT NULL,
                AssignedTo VARCHAR(50) NOT NULL,
                FOREIGN KEY (AssignedBy) REFERENCES SystemUser(UserID)
            )`;
            connection.query(createAssignmentTable, function (err) {
                if (err) {
                    console.error("Error creating TaskAssignment table: ", err);
                    return;
                }
                console.log("TaskAssignment Table created");
            });

            // Create the Announcements table
            const createAnnTable = `
                CREATE TABLE IF NOT EXISTS Announcements (
                AnnouncementID INT AUTO_INCREMENT PRIMARY KEY,
                AnnouncementDetails VARCHAR(255) NOT NULL,
                AnnouncedBy INT,
                FOREIGN KEY (AnnouncedBy) REFERENCES SystemUser(UserID)   
        )`;
        connection.query(createAnnTable, function (err) {
            if (err) {
                console.error("Error creating Announcements table: ", err);
                return;
            }
            console.log("Announcements Table created");
        });

            // Create the Budget table
            const createBudgetTable = `
                CREATE TABLE IF NOT EXISTS Budget (
                BudgetID INT AUTO_INCREMENT PRIMARY KEY,
                AllocatedAmount DECIMAL(10, 2) NOT NULL,
                Category VARCHAR(100) NOT NULL,
                Description TEXT,
                EventID INT,
                ItemID INT,
                FOREIGN KEY (EventID) REFERENCES Events(EventID),
                FOREIGN KEY (ItemID) REFERENCES MenuItems(ItemID)
        )`;
        connection.query(createBudgetTable, function (err) {
            if (err) {
                console.error("Error creating Budget table: ", err);
                return;
            }
            console.log("Budget Table created");
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

// Open menu management page for client(student)
app.get('/food_modification', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/menu_management.html')); 
});

// Endpoint to handle menu modification
app.post('/modify_menu', function(req, res) {
    const { choice, newItemName, newItemPrice, deleteItemName } = req.body;
    
    if (choice === 'add') {
        // add a new item
        const insertNewItem = 'INSERT INTO MenuItems (ItemName, BudgetAllocated) VALUES (?, ?)';
        connection.query(insertNewItem, [newItemName, newItemPrice], function(err) {
            if (err) {
                console.error('Failed to add new menu item:', err);
                return res.status(500).send("Error adding new menu item.");
            }
           
            res.redirect('/food_selection');
        });
    } 
    else if (choice === 'delete') 
    {
        // delete an exsisting item
        const deleteItem = 'DELETE FROM MenuItems WHERE ItemName = ?';
        connection.query(deleteItem, [deleteItemName], function(err) {
            if (err) {
                console.error('Failed to delete menu item:', err);
                return res.status(500).send("Error deleting menu item.");
            }
            
            res.redirect('/food_selection');
        });
    }
});

// Open menu page for client(student)
app.get('/food_selection', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/menu.html'));
});


// app.post('/submit_vote', function(req, res) {
//     const studentID = req.session.studentID; 
//     const items = req.body.itemID;

//     // Handle single and multiple item submissions
//     const itemIDs = Array.isArray(items) ? items : [items];

//     itemIDs.forEach((itemID) => {
//         const studentFoodVote = 'INSERT INTO StudentSuggestions (StudentID, ItemID) VALUES (?, ?)';
//         connection.query(studentFoodVote, [studentID, itemID], function(err, result) {
//             if (err) {
//                 console.error('Failed to insert vote:', err);
//                 return res.status(500).send("Error processing your vote.");
//             }
//         });
//     });

//     res.send("Vote successfully recorded!");
// });


// Endpoint to handle vote submission
app.post('/submit_vote', async function(req, res) {
    const studentID = req.session.studentID; 
    const items = req.body;
    console.log("Items Received:", items);

    try {
        for (let type in items) {
            let itemName = items[type];
            let itemBudget = parseInt(itemName.split("- Rs.")[1]); // Extracting price from the string
            let itemNameClean = itemName.split(" - Rs.")[0];

            // Insert into MenuItems
            const insertQuery = "INSERT INTO MenuItems (ItemName, BudgetAllocated) VALUES (?, ?)";
            const result = await queryAsync(insertQuery, [itemNameClean, itemBudget]);

            // Insert into StudentSuggestion
            const suggestionQuery = "INSERT INTO StudentSuggestion (StudentID, ItemID) VALUES (?, ?)";
            await queryAsync(suggestionQuery, [studentID, result.insertId]);
        }

        res.send("Vote successfully recorded!");
    } catch (err) {
        console.error('Failed to process vote:', err);
        res.status(500).send("Error processing your vote.");
    }
});

function queryAsync(query, params) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}


// Open task assignment page for client
app.get('/assignments', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/task_assignment.html')); 
});

// Endpoint to handle task assignment
app.post('/assign_task', function(req, res) {
    // Parse sessionID of user logged in
    const assignedBy = req.session.studentID;
    const { taskDetails, assignedTo } = req.body;
    // Check is user is signed in, and verify fields of the form
    if (!assignedBy) 
    {
        return res.status(401).send("You must be logged in to assign tasks.");
    }
    if (!taskDetails || !assignedTo) 
    {
        return res.status(400).send("Task details and assigned team are required.");
    }
    const insertTaskQuery = `
        INSERT INTO TaskAssignment (TaskDetails, AssignedBy, AssignedTo) 
        VALUES (?, ?, ?)
    `;
    // AssignedBy and To columns take in the ID of user who assigned the task and the team to whom the task is assigned respectively
    connection.query(insertTaskQuery, [taskDetails, assignedBy, assignedTo], function(err, result) {
        if (err) 
        {
            console.error('Failed to insert new task:', err);
            return res.status(500).send("Error adding new task.");
        }
        // res.redirect('/progress_tracker'); go to this page afer tasks are assigned
    });
});


// Open add announcement page for client
app.get('/announcements', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/add_announcement.html')); 
});

// Endpoint to handle announcements
app.post('/submit_announcement', function(req, res) {
    // Parse sessionID of user logged in
    const announcedBy = req.session.studentID;
    const { announcementDetails } = req.body;
    // Check is user is signed in, and verify fields of the form
    if (!announcedBy) 
    {
        return res.status(401).send("You must be logged in to make announcements.");
    }
    if (!announcementDetails) 
    {
        return res.status(400).send("Please add something.");
    }
    const insertAnnQuery = `
        INSERT INTO Announcements (AnnouncementDetails, AnnouncedBy) 
        VALUES (?, ?)
    `;
    // AnnouncedBy takes in the ID of user who made the announcement 
    connection.query(insertAnnQuery, [announcementDetails, announcedBy], function(err, result) {
        if (err) 
        {
            console.error('Failed to insert announcement:', err);
            return res.status(500).send("Error adding announcement.");
        }
        res.status(200).send("Announcement has been added successfully.");
        // res.redirect('/'); go somewhere idk
    });
});

// Open view updates page for client which will render updates and announcements
app.get('/view_updates', function(req, res) {
    const taskQuery= "SELECT TaskDetails FROM TaskAssignment";
    const announcementQuery= "SELECT AnnouncementDetails FROM Announcements";
    
    connection.query(taskQuery, function(taskErr, taskResults) {
        if (taskErr) {
            console.error('Failed to retrieve tasks:', taskErr);
            return res.status(500).send("Error retrieving tasks.");
        }

        connection.query(announcementQuery, function(announcementErr, announcementResults) {
            if (announcementErr) {
                console.error('Failed to retrieve announcements:', announcementErr);
                return res.status(500).send("Error retrieving announcements.");
            }

            res.render('updates', { tasks: taskResults, announcements: announcementResults });
        });
    });
});


// Open budget page for client
app.get('/budget', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/budget_view.html')); 
});


// Endpoint to add budget
app.post('/add_budget', function(req, res) {
    const { dinnerBudget, decorationBudget, eventBudget } = req.body;
    const dinnerDescription= "This budget may vary";
    const decorationDescription= "This budget may or may not vary";
    const eventDescription= "This budget may vary";

    // Inserting the budget data into the Budget table
    connection.query('INSERT INTO Budget (AllocatedAmount, Category, Description) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)', 
    [dinnerBudget, 'Dinner', dinnerDescription, decorationBudget, 'Decoration', decorationDescription, eventBudget, 'Event', eventDescription], 
    function(err, result) {
        if (err) {
            console.error('Failed to add budget:', err);
            return res.status(500).send("Error adding budget.");
        }
        res.send("Budget added successfully.");
    });
});


// Open expense tracking page for client which will render expenses for menu, events etc
app.get('/view_expenses', function(req, res) {
    const expenseMenuQuery= "SELECT SUM(BudgetAllocated) AS MenuExpenses FROM MenuItems";
    
    connection.query(expenseMenuQuery, function(menuErr, MenuExpense) {
        if (menuErr) {
            console.error('Failed to retrieve menu expenses:', menuErr);
            return res.status(500).send("Error retrieving menu expenses.");
        }

        res.render('expenses', { menuItems: MenuExpense });
    });
});

// Open adjust budget page for client
app.get('/budget_modification', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/modify_budget.html')); 
});

// Endpoint to adjust budget
app.post('/adjust_budget', function(req, res) {
    const { category, adjustment } = req.body;
    const increase = req.body.increase !== undefined; // Check if increase button is clicked
    const adjustmentValue = increase ? adjustment : -adjustment;
    // Updating the budget in the Budget table
    connection.query('UPDATE Budget SET AllocatedAmount = AllocatedAmount + ? WHERE Category = ?', 
    [adjustmentValue, category], 
    function(err, result) {
        if (err) {
            console.error('Failed to adjust budget:', err);
            return res.status(500).send("Error adjusting budget.");
        }
        res.send("Budget adjusted successfully.");
    });
});
