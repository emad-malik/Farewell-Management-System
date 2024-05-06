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
    StudentRole NOT NULL,
    UserID int,
    FOREIGN KEY (UserID) REFERENCES SystemUser(UserID)
    
);

CREATE TABLE IF NOT EXISTS Teachers (
	TeacherID int AUTO_INCREMENT primary key NOT NULL,
    TeFamilyMembers int,
    UserID int,
    FOREIGN KEY (UserID) REFERENCES SystemUser(UserID)
);


    

    
    
    



