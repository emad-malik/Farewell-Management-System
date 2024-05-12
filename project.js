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
app.use(express.static(path.join(__dirname, 'public')));
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
                    UserID INT NOT NULL,  
                    FOREIGN KEY (UserID) REFERENCES Students(UserID)
                        
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
                    UserID INT NOT NULL,
                    ItemID INT NOT NULL,
                    PRIMARY KEY (UserID, ItemID),
                    FOREIGN KEY (UserID) REFERENCES Students(UserID),
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

// Open main home page for
app.get('/intropg', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/homepage.html'));
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
            console.log("Session UserID set:", req.session.studentID);
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
            res.redirect('/teacher_homepg');
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

// Open main home page for client(student)
app.get('/teacher_homepg', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/teacher_dashboard.html'));
});

function queryAsync(query, params) {
    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// Open menu management page for client 
app.get('/food_modification', async function(req, res) {
    const userID = req.session.userID; 

    try {
        // const roleCheckQuery = "SELECT StudentRole FROM Students WHERE UserID = ?";
        // const results = await queryAsync(roleCheckQuery, [userID]);

        // // Check if results are empty or role is not authorized
        // if (results.length === 0 || (results[0].StudentRole !== 'Dinner Team Manager' && results[0].StudentRole !== 'Dinner Team Member')) {
        //     console.log(results); // Check what the actual results are
        //     return res.status(403).send("You are not authorized to perform this action.");
        // }
        
        res.sendFile(path.join(__dirname, 'public/menu_management.html'));
    } catch (err) {
        console.error('Failed to verify user role:', err);
        res.status(500).send("Error accessing menu management page.");
    }
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


// Endpoint to handle menu vote submission
// app.post('/submit_vote', async function(req, res) {
//     const userID = req.session.studentID;
//     const items = req.body;

//     try {
//         // const roleCheckQuery = "SELECT StudentRole FROM Students WHERE UserID = ?";
//         // const result = await queryAsync(roleCheckQuery, [userID]);

//         // if (result.length === 0 || (result[0].StudentRole !== 'Dinner Team Manager' && result[0].StudentRole !== 'Dinner Team Member')) {
//         //     return res.status(403).send("You are not authorized to perform this action.");
//         // }

//         for (let type in items) {
//             let itemName = items[type];
//             let itemBudget = parseInt(itemName.split("- Rs.")[1]); // Extracting price from the string
//             let itemNameClean = itemName.split("- Rs.")[0];

//             // Insert into MenuItems
//             const insertQuery = "INSERT INTO MenuItems (ItemName, BudgetAllocated) VALUES (?, ?)";
//             const insertResult = await queryAsync(insertQuery, [itemNameClean, itemBudget]);

//             // Insert into StudentSuggestion
//             const suggestionQuery = "INSERT INTO StudentSuggestion (UserID, ItemID) VALUES (?, ?)";
//             await queryAsync(suggestionQuery, [userID, insertResult.insertId]);
//         }

//         res.send("Vote successfully recorded!");
//     } catch (err) {
//         console.error('Failed to process vote:', err);
//         res.status(500).send("Error processing your vote.");
//     }
// });

// Endpoint to handle menu vote submission
app.post('/submit_vote', async function(req, res) {
    const userID = req.session.studentID;
    const items = req.body;

    try {
        for (let type in items) {
            let itemName = items[type];
            let itemBudget = parseInt(itemName.split("- Rs.")[1]); // Extracting price from the string
            let itemNameClean = itemName.split("- Rs.")[0];

            // First, check if the ItemID exists
            const checkItemQuery = "SELECT COUNT(*) AS count FROM MenuItems WHERE ItemName = ?";
            const checkItemResult = await queryAsync(checkItemQuery, [itemNameClean]);

            if (checkItemResult[0].count > 0) {
                // If ItemID exists, update the vote count
                const updateVoteQuery = "UPDATE MenuItems SET TotalVotes = TotalVotes + 1 WHERE ItemName = ?";
                await queryAsync(updateVoteQuery, [itemNameClean]);
            } else {
                // If ItemID doesn't exist, insert the new item
                const insertQuery = "INSERT INTO MenuItems (ItemName, BudgetAllocated) VALUES (?, ?)";
                const insertResult = await queryAsync(insertQuery, [itemNameClean, itemBudget]);
            }

            // Insert into StudentSuggestion
            const suggestionQuery = "INSERT INTO StudentSuggestion (UserID, ItemID) VALUES (?, (SELECT ItemID FROM MenuItems WHERE ItemName = ?))";
            await queryAsync(suggestionQuery, [userID, itemNameClean]);
        }
        res.redirect('/homepage');
        console.log("Vote successfully recorded!");
    } catch (err) {
        console.error('Failed to process vote:', err);
        res.status(500).send("Error processing your vote.");
    }
});



// Open task assignment page for client
app.get('/assignments', async function(req, res) {
    const userID = req.session.userID; // assuming the user ID is stored in session when they log in

    try {
        // Check if the logged-in user is a manager of any authorized team
        // const roleCheckQuery = "SELECT StudentRole FROM Students WHERE UserID = ?";
        // const roleResult = await queryAsync(roleCheckQuery, [userID]);

        // // Define the authorized roles
        // const authorizedRoles = ['Dinner Team Manager', 'Performance Team Manager', 'Invitation Team Manager', 'Budget Team Manager'];

        // if (roleResult.length === 0 || !authorizedRoles.includes(roleResult[0].Role)) {
        //     return res.status(403).send("You are not authorized to view this page.");
        // }

        res.sendFile(path.join(__dirname, 'public/task_assignment.html'));
    } catch (err) {
        console.error('Failed to verify user role:', err);
        res.status(500).send("Error accessing task assignment page.");
    }
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
app.get('/view_updates', async function(req, res) {
    const userID = req.session.studentID; 

    try {
        // Check if the logged-in user is a senior student
        // const roleCheckQuery = "SELECT StudentRole FROM Students WHERE UserID = ?";
        // const roleResult = await queryAsync(roleCheckQuery, [userID]);

        // if (roleResult.length === 0 || roleResult[0].StudentRole !== 'Senior Student') {
        //     return res.status(403).send("You are not authorized to view this page.");
        // }

        // Queries to get tasks and announcements
        const taskQuery = "SELECT TaskDetails FROM TaskAssignment";
        const announcementQuery = "SELECT AnnouncementDetails FROM Announcements";
        
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
    } catch (err) {
        console.error('Failed to verify user role:', err);
        res.status(500).send("Error accessing updates page.");
    }
});


// Open budget page for client
app.get('/budget', async function(req, res) {
    const userID = req.session.userID;

    try {
        // const roleCheckQuery = "SELECT StudentRole FROM Students WHERE UserID = ?";
        // const roleResult = await queryAsync(roleCheckQuery, [userID]);

        // if (roleResult.length === 0 || roleResult[0].Role !== 'Budget Team Manager') {
        //     return res.status(403).send("You are not authorized to view this page.");
        // }

        res.sendFile(path.join(__dirname, 'public/budget_view.html'));
    } catch (err) {
        console.error('Failed to verify user role:', err);
        res.status(500).send("Error accessing budget page.");
    }
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
        console.log("Budget added successfully.");
        res.redirect('/budget_modification');
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
        console.log("Budget adjusted successfully.");
        res.redirect('/view_expenses');
    });
});

// Open performance proposal page for client
app.get('/view_performance', async function(req, res) {
    const userID = req.session.userID; 

    try {
        // Check if the logged-in user is a part of the performance team
        const roleCheckQuery = "SELECT StudentRole FROM Students WHERE UserID = ?";
        const roleResult = await queryAsync(roleCheckQuery, [userID]);

        // // Check if the user has the required role
        // if (roleResult[0].StudentRole !== 'Performance Team Manager' && roleResult[0].StudentRole !== 'Performance Team Member') {
        //     return res.status(403).send("You are not authorized to perform this action.");
        // }

        res.sendFile(path.join(__dirname, 'public/propose_performance.html'));
    } catch (err) {
        console.error('Failed to verify user role:', err);
        res.status(500).send("Error accessing performance proposal page.");
    }
});

// Endpoint to handle proposal submission with role check
app.post('/submit_performance', async (req, res) => {
    const { title, duration, specialRequirements } = req.body;
    const studentID = req.session.studentID; 

    try {
        // Check if the logged-in user is a student
        const roleCheckQuery = "SELECT StudentRole FROM Students WHERE UserID = ?";
        // const roleResult = await queryAsync(roleCheckQuery, [studentID]);

        // if (roleResult.length === 0) {
        //     res.status(404).send('Student not found');
        //     return;
        // }

        // // Allow only certain student roles to submit performances
        // if (roleResult[0].StudentRole !== 'Performance Team Manager' && roleResult[0].StudentRole !== 'Performance Team Member') {
        //     return res.status(403).send("You are not authorized to perform this action.");
        // }

        // Insert performance if student exists and is authorized
        const sql = 'INSERT INTO Performance (Title, Duration, Special_Requirements, PerformanceStatus, UserID) VALUES (?, ?, ?, ?, ?)';
        const values = [title, duration, specialRequirements, 'Proposed', studentID];
        await queryAsync(sql, values);
        
        console.log('New performance proposed');
        res.redirect('/homepage');

    } catch (err) {
        console.error('Error in proposing performance:', err);
        res.status(500).send('Error proposing performance');
    }
});


// Open manage performance page for client
app.get('/view_perf_management', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/manage_performance.html'));
});

// Endpoint to handle performance management with role check
app.post('/manage_performances', async (req, res) => {
    const performanceID = req.body.performanceID;
    const newStatus = req.body.status;

    try {
        // Update performance status 
        const updateStatus = `UPDATE Performance SET PerformanceStatus = ? WHERE PerformanceID = ?`;
        await queryAsync(updateStatus, [newStatus, performanceID]);

        console.log('Performance status updated successfully');
        res.redirect('/homepage');

    } catch (err) {
        console.error('Error updating performance status:', err);
        res.status(500).send('Error updating performance status');
    }
});


// Open event reg event page for teacher
app.get('/teacherEvent_reg', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/teacher_event.html')); 
});

// Endpoint to handle teacher event registration
app.post('/teacher_event_registration', function(req, res) {
    const { teacherID, teacherName, familyMembers } = req.body;

    const checkTeacher = 'SELECT * FROM Teachers WHERE TeacherID = ?';
    connection.query(checkTeacher, [teacherID], (err, results) => {
        if (err) {
            console.error('Database error while checking teacher:', err);
            res.status(500).send('Error checking teacher');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Teacher ID not found');
            return;
        }

        const updateTeacherDetailsQuery = 'UPDATE Teachers SET TeacherName = ?, TeFamilyMembers = ? WHERE TeacherID = ?';
        connection.query(updateTeacherDetailsQuery, [teacherName, familyMembers, teacherID], (err, result) => {
            if (err) {
                console.error('Database error while updating teacher details:', err);
                res.status(500).send('Error updating teacher details');
                return;
            }

            console.log('Teacher details updated successfully');
            res.redirect('/teacher_homepg');
        });
    });
});


// Open event reg page for teacher
app.get('/studentEvent_reg', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/student_event.html')); 
});


// Endpoint to handle student event registration
app.post('/student_event_registration', function(req, res) {
    const { studentID, studentName, familyMembers } = req.body;

    const checkStudent = 'SELECT * FROM Students WHERE StudentID = ?';
    connection.query(checkStudent, [studentID], (err, results) => {
        if (err) {
            console.error('Database error while checking student:', err);
            res.status(500).send('Error checking student');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Student ID not found');
            return;
        }

        const updateTeacherDetailsQuery = 'UPDATE Students SET StudentName = ?, StuFamilyMembers = ? WHERE StudentID = ?';
        connection.query(updateTeacherDetailsQuery, [studentName, familyMembers, studentID], (err, result) => {
            if (err) {
                console.error('Database error while updating student details:', err);
                res.status(500).send('Error updating student details');
                return;
            }

            console.log('Student details updated successfully');
            res.redirect('/homepage')
        });
    });
});

app.get('/view_attendance', function (req, res) {
    connection.query('SELECT COUNT(*) AS studentCount FROM Students WHERE StuFamilyMembers IS NOT NULL', (err, studentCountResult) => {
        if (err) throw err;

        const studentCount = studentCountResult[0].studentCount;

        connection.query('SELECT * FROM Students WHERE StuFamilyMembers IS NOT NULL', (err, students) => {
            if (err) throw err;

            connection.query('SELECT COUNT(*) AS teacherCount FROM Teachers WHERE TeFamilyMembers IS NOT NULL', (err, teacherCountResult) => {
                if (err) throw err;

                const teacherCount = teacherCountResult[0].teacherCount;

                connection.query('SELECT * FROM Teachers WHERE TeFamilyMembers IS NOT NULL', (err, teachers) => {
                    if (err) throw err;

                    res.render('attendance', { studentCount, teacherCount, students, teachers });
                });
            });
        });
    });
});

// Open event page for client
app.get('/view_events', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/events.html')); 
});

// Endpoint to handle events
app.post('/register_events', async (req, res) => {
    const studentID = req.session.studentID; 

    try {
        const selectedEvents = req.body.events;

        for (const eventName of selectedEvents) {
            const insertEventQuery = "INSERT INTO Events (EventName, EventDate, EventBudget) VALUES (?, ?, ?)";
            const eventBudget= 3000; // predefined
            await queryAsync(insertEventQuery, [eventName, new Date(), eventBudget]);
        }

        // Insert entries into the RegistersFor table to associate student with selected events
        for (const eventName of selectedEvents) {
            const eventIDQuery = "SELECT EventID FROM Events WHERE EventName = ?";
            const eventIDResult = await queryAsync(eventIDQuery, [eventName]);
            const eventID = eventIDResult[0].EventID;

            const registerQuery = "INSERT INTO RegistersFor (EventID, UserID) VALUES (?, ?)";
            await queryAsync(registerQuery, [eventID, studentID]);
        }

        res.send("Events registered successfully!");
    } catch (err) {
        console.error('Error registering events:', err);
        res.status(500).send("Error registering events");
    }
});

// show user the final menu
app.get('/final_menu', async (req, res) => {
    try {
        const finalMenuQuery = "SELECT ItemName, TotalVotes FROM MenuItems ORDER BY TotalVotes DESC LIMIT 5";
        connection.query(finalMenuQuery, (err, results) => {
            if (err) {
                console.error('Error fetching final menu:', err);
                res.status(500).send("Error fetching final menu.");
            } else {
                res.render('final_menu', { menuItems: results });
            }
        });
    } catch (err) {
        console.error('Error processing final menu request:', err);
        res.status(500).send("Error processing final menu request.");
    }
});
