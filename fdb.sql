CREATE DATABASE IF NOT EXISTS FarewellMS;
USE FarewellMS;
CREATE TABLE IF NOT EXISTS SystemUser (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    EmailID VARCHAR(255) NOT NULL,
    ContactNumber VARCHAR(25),
    Type ENUM('Student', 'Teacher') NOT NULL
);
INSERT INTO SystemUser (Username, Password, EmailID, ContactNumber, Type)
VALUES 
('JohnDoe', 'password123', 'johndoe@example.com', '1234567890', 'Student'),
('JaneDoe', 'password456', 'janedoe@example.com', '0987654321', 'Teacher'),
('AliceSmith', 'password789', 'alicesmith@example.com', '1122334455', 'Student'),
('BobJohnson', 'password321', 'bobjohnson@example.com', '5566778899', 'Teacher'),
('CarolWhite', 'password654', 'carolwhite@example.com', '9988776655', 'Student');

CREATE TABLE IF NOT EXISTS UserRegistrationLog (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    RegistrationDate DATETIME NOT NULL,
    FOREIGN KEY (UserID) REFERENCES SystemUser(UserID)
);

DELIMITER $$
CREATE TRIGGER user_logging
AFTER INSERT ON SystemUser
FOR EACH ROW
BEGIN
    INSERT INTO UserRegistrationLog(UserID, RegistrationDate)
    VALUES (NEW.UserID, NOW());
END $$
DELIMITER ;

CREATE TABLE IF NOT EXISTS Students (
	StudentID int AUTO_INCREMENT PRIMARY KEY NOT NULL,
    StuFamilyMembers int,
    DietaryPreference ENUM('Vegan', 'Non-Vegan') NOT NULL,
    UserID int,
    FOREIGN KEY (UserID) REFERENCES SystemUser(UserID)
    
);
CREATE TABLE IF NOT EXISTS Teachers (
	TeacherID int AUTO_INCREMENT primary key NOT NULL,
    TeFamilyMembers int,
    UserID int,
    FOREIGN KEY (UserID) REFERENCES SystemUser(UserID)
);

ALTER TABLE Teachers ADD TeacherName VARCHAR(30) AFTER TeacherID;
ALTER TABLE Students ADD StudentName VARCHAR(30) AFTER StudentID;


CREATE TABLE IF NOT EXISTS Venue (
	VenueID int AUTO_INCREMENT primary key NOT NULL,
    VenueName varchar(225) NOT NULL,
	Address varchar(225) NOT NULL,
	Capacity int NOT NULL
);


CREATE TABLE IF NOT EXISTS Events (
	EventID int AUTO_INCREMENT primary key NOT NULL,
    EventName varchar(225) NOT NULL,
    EventDate DATE NOT NULL,
    VenueID int,
    FOREIGN KEY (VenueID) REFERENCES Venue(VenueID)

);#need to make VanueID NOT NULL in this as there is total particapation from venue. User alter statement
ALTER TABLE Events ADD EventBudget INT;

CREATE TABLE IF NOT EXISTS Performance (
    PerformanceID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    Title VARCHAR(225) NOT NULL UNIQUE,  
    Duration TIME,
    Special_Requirements VARCHAR(225),
    PerformanceStatus ENUM('Proposed', 'Accepted') NOT NULL,
	UserID INT NOT NULL,  
    FOREIGN KEY (UserID) REFERENCES Students(UserID)
);

ALTER TABLE Performance DROP FOREIGN KEY performance_ibfk_1;
ALTER TABLE Performance DROP COLUMN StudentID;

/*
CREATE VIEW Vote_Count_View AS
SELECT s.StudentID, COUNT(p.PerformanceID) AS Vote_Count
FROM Students s
LEFT JOIN Performance p ON s.StudentID = p.StudentID
GROUP BY s.StudentID;
*/#THIS IS TO BE EXCUTED TO FIND THE VOTE_COUNT OF EACH EMPLOYEE AND CREATE A VIEW FOR THAT ATTRIBUTE

CREATE TABLE IF NOT EXISTS MenuItems (
    ItemID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    ItemName VARCHAR(225) NOT NULL UNIQUE,  
    BudgetAllocated INT
);
ALTER TABLE MenuItems ADD COLUMN TotalVotes INT NOT NULL DEFAULT 0;


CREATE TABLE IF NOT EXISTS StudentSuggestion (
	UserID INT NOT NULL,
	ItemID INT NOT NULL,
	PRIMARY KEY (UserID, ItemID),
	FOREIGN KEY (UserID) REFERENCES Students(UserID),
	FOREIGN KEY (ItemID) REFERENCES MenuItems(ItemID)
);

CREATE TABLE IF NOT EXISTS RegistersFor(
	EventID INT NOT NULL,
    UserID INT NOT NULL,
    PRIMARY KEY (UserID, EventID),
    FOREIGN KEY (UserID) REFERENCES Students(UserID),
    FOREIGN KEY (EventID) REFERENCES Events(EventID)
);

CREATE TABLE Budget (
    BudgetID INT AUTO_INCREMENT PRIMARY KEY,
    AllocatedAmount DECIMAL(10, 2) NOT NULL,
    Category VARCHAR(100) NOT NULL,
    Description TEXT,
    EventID INT,
    ItemID INT,
    FOREIGN KEY (EventID) REFERENCES Events(EventID),
    FOREIGN KEY (ItemID) REFERENCES MenuItems(ItemID)
);


CREATE TABLE IF NOT EXISTS TaskAssignment (
    TaskID INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    TaskDetails VARCHAR(255),
    AssignedBy INT NOT NULL,
    AssignedTo VARCHAR(50) NOT NULL,
    FOREIGN KEY (AssignedBy) REFERENCES SystemUser(UserID)
);


CREATE TABLE IF NOT EXISTS Announcements (
    AnnouncementID INT AUTO_INCREMENT PRIMARY KEY,
    AnnouncementDetails VARCHAR(255) NOT NULL,
    AnnouncedBy INT,
    FOREIGN KEY (AnnouncedBy) REFERENCES SystemUser(UserID)
);

-- stored procedure for dinner menu budget
DELIMITER $$
CREATE PROCEDURE MenuBudgetThreshold()
BEGIN
	DECLARE TotalAllocated DECIMAL(10, 2);
    DECLARE DinnerThreshold DECIMAL(10, 2);
    SELECT SUM(BudgetAllocated) INTO totalAllocated FROM MenuItems; -- total allocation from menu table
    SELECT AllocatedAmount INTO DinnerThreshold FROM Budget WHERE Category = 'Dinner'; -- allocation for dinner menu
    IF TotalAllocated > DinnerThreshold THEN
		INSERT INTO Announcements (AnnouncementDetails, AnnouncedBy)
		VALUES ('Budget threshold exceeded for Dinner category! Keep it low!', 1);
	END IF;
END $$
DELIMITER ;

-- stored procedure for event budget
DELIMITER $$
CREATE PROCEDURE EventBudgetThreshold()
BEGIN
	DECLARE TotalAllocated DECIMAL(10, 2);
    DECLARE EventThreshold DECIMAL(10, 2);
    SELECT SUM(EventBudget) INTO totalAllocated FROM Events; -- total allocation from event table
    SELECT AllocatedAmount INTO EventThreshold FROM Budget WHERE Category = 'Event'; -- allocation for events
    IF TotalAllocated > EventThreshold THEN
		INSERT INTO Announcements (AnnouncementDetails, AnnouncedBy)
		VALUES ('Budget threshold exceeded for Events! Keep it low!', 1);
	END IF;
END $$
DELIMITER ;

-- stored procedure for decorations budget
-- DELIMITER $$
-- CREATE PROCEDURE DecorationBudgetThreshold()
-- BEGIN
-- 	DECLARE TotalAllocated DECIMAL(10, 2);
--     DECLARE DecorThreshold DECIMAL(10, 2);
--     SELECT SUM(EventBudget) INTO totalAllocated FROM EventDecoration; -- total allocation from decor table
--     SELECT AllocatedAmount INTO DecorThreshold FROM Budget WHERE Category = 'Decoration'; -- allocation for decor
--     IF TotalAllocated > DecorThreshold THEN
-- 		INSERT INTO Announcements (AnnouncementDetails, AnnouncedBy)
-- 		VALUES ('Budget threshold exceeded for Events! Keep it low!', 1);
-- 	END IF;
-- END $$
-- DELIMITER ;

CALL MenuBudgetThreshold();
CALL EventBudgetThreshold();
-- CALL DecorationBudgetThreshold();

-- trigger to update totalVotes when a new vote is recorded
DELIMITER $$
CREATE TRIGGER UpdateVoteCount
BEFORE INSERT ON StudentSuggestion
FOR EACH ROW
BEGIN
    DECLARE itemExists INT;
    SET itemExists = (SELECT COUNT(*) FROM MenuItems WHERE ItemID = NEW.ItemID);
    IF itemExists > 0 THEN
        UPDATE MenuItems
        SET TotalVotes = TotalVotes + 1
        WHERE ItemID = NEW.ItemID;
        
        -- Prevent insertion by setting the new vote's primary key to NULL
        SET NEW.ItemID = NULL;
    END IF;
END$$
DELIMITER ;



-- SELECT CONSTRAINT_NAME
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
-- WHERE TABLE_NAME = 'RegistersFor' AND COLUMN_NAME = 'StudentID';


-- SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'MenuItmes';

-- ALTER TABLE StudentSuggestion DROP FOREIGN KEY studentsuggestion_ibfk_1;

-- ALTER TABLE StudentSuggestion ADD FOREIGN KEY (StudentID) REFERENCES Students(StudentID);
-- SET SQL_SAFE_UPDATES = 1;

ALTER TABLE SystemUser ADD CONSTRAINT email_unique UNIQUE (EmailID);
ALTER TABLE SystemUser ADD CONSTRAINT email_unique UNIQUE (Password);
