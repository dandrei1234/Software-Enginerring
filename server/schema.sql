CREATE DATABASE softeng_sports_rental1;
USE softeng_sports_rental1;

CREATE TABLE `users_tbl` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('student','staff') NOT NULL DEFAULT 'student',
  `password` varchar(255) NOT NULL,
  `registration_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `email` (`email`)
);

CREATE TABLE `password_reset_requests_tbl` (
  `requestID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `new_password_hash` varchar(255) NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `request_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`requestID`),
  KEY `userID` (`userID`),
  CONSTRAINT `password_reset_requests_tbl_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users_tbl` (`userID`) ON DELETE CASCADE
);

CREATE TABLE `equipment_category_tbl` (
  `categoryID` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`categoryID`)
);
INSERT INTO `equipment_category_tbl` VALUES (1,'Ball Games'),(2,'Racket Sports');

CREATE TABLE `equipment_tbl` (
  `equipmentID` int NOT NULL AUTO_INCREMENT,
  `categoryID` int DEFAULT NULL,
  `equipment_name` varchar(255) NOT NULL,
  `description` text,
  `image_url` text,
  PRIMARY KEY (`equipmentID`),
  KEY `categoryID` (`categoryID`),
  CONSTRAINT `equipment_tbl_ibfk_1` FOREIGN KEY (`categoryID`) REFERENCES `equipment_category_tbl` (`categoryID`) ON DELETE CASCADE
);
INSERT INTO `equipment_tbl` VALUES (1,2,'Basketball (Spalding)',NULL,NULL),(2,2,'Volleyball (Mikasa)',NULL,NULL),(3,2,'Badminton Racket',NULL,NULL),(4,1,'Table Tennis Paddle',NULL,NULL),(5,1,'Soccer Ball',NULL,NULL);


INSERT INTO `users_tbl` VALUES (1,'System Admin','staff@smu.edu.ph','staff','admin123','2026-04-01 15:36:06'),(2,'Sample Student','student@smu.edu.ph','student','student123','2026-04-01 15:36:06'),(3,'staff','staff','staff','$2b$10$1AlOYD0MnQjI3f/bQ47KZeDPVGU.QKxM8B5XA0KpSAb1tBIuhgZou','2026-04-01 18:35:48'),(4,'stud','stud','student','$2b$10$bI6pId28y5wptINHiyew1ODv8qSXHtPG4PXQsbUJlxdd4kKhSE7Mq','2026-04-01 18:36:26'),(5,'admin','admin','staff','$2b$10$OlFUfi7Afi8cnIUyNZb8y.2HNLK3oWIzqz15OYBf9uk6D6SFIyAjW','2026-04-02 12:45:52'),(6,'asd','ad','student','$2b$10$F6VFy.AL56ZEtImdYDVcD.5hILKHZ4U/48TQ.brfCgp/BHhaqyFDS','2026-04-02 16:30:17'),(7,'staff2','staff@gmail.com','student','$2b$10$1aHygoh3Lu20U8zt2oXCQezGod5fU9TeV24SfOnep5.Hywiu3n8aW','2026-04-02 16:34:52'),(8,'staff3','staff3@gmail.com','student','$2b$10$O8PrdE/VIOA5SOjIvGULHO2I0MyB/Y20iSS9A.aiOBAJH5s23Oh7S','2026-04-02 16:40:52');

CREATE TABLE `audit_log_tbl` (
  `logID` int NOT NULL AUTO_INCREMENT,
  `userID` int DEFAULT NULL,
  `action_type` varchar(100) DEFAULT NULL,
  `action_details` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`logID`),
  KEY `userID` (`userID`),
  CONSTRAINT `audit_log_tbl_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users_tbl` (`userID`) ON DELETE SET NULL
);

CREATE TABLE `rental_items_tbl` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `equipmentID` int NOT NULL,
  `total_quantity` int DEFAULT '1',
  `available_quantity` int DEFAULT '1',
  PRIMARY KEY (`itemID`),
  KEY `equipmentID` (`equipmentID`),
  CONSTRAINT `rental_items_tbl_ibfk_1` FOREIGN KEY (`equipmentID`) REFERENCES `equipment_tbl` (`equipmentID`) ON DELETE CASCADE
) ;
INSERT INTO `rental_items_tbl` VALUES (1,1,5,0),(2,2,10,0),(3,3,3,0),(4,4,5,0),(5,5,3,3);

CREATE TABLE `rentals_tbl` (
  `rentalID` int NOT NULL AUTO_INCREMENT,
  `itemID` int DEFAULT NULL,
  `userID` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `condition_status` enum('New','Good','Fair','Damaged') DEFAULT 'Good',
  /* Added 'Cancelled' to the list below */
  `borrow_status` enum('Pending','Approved','Returned','Overdue','Rejected','Cancelled') DEFAULT 'Pending',
  `request_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `due_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `return_date` datetime DEFAULT NULL,
  PRIMARY KEY (`rentalID`),
  KEY `itemID` (`itemID`),
  KEY `userID` (`userID`),
  CONSTRAINT `rentals_tbl_ibfk_1` FOREIGN KEY (`itemID`) REFERENCES `rental_items_tbl` (`itemID`) ON DELETE CASCADE,
  CONSTRAINT `rentals_tbl_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users_tbl` (`userID`) ON DELETE CASCADE
);
INSERT INTO `rentals_tbl` VALUES (1,2,1,2,'Good','Rejected','2026-04-01 15:44:10','2026-04-01 15:44:10',NULL),(2,2,1,2,'Good','Approved','2026-04-01 15:45:55','2026-04-01 15:45:55',NULL),(3,5,1,2,'Good','Pending','2026-04-01 15:45:55','2026-04-01 15:45:55',NULL),(4,1,1,2,'Good','Approved','2026-04-01 15:45:55','2026-04-01 15:45:55',NULL),(14,NULL,1,5,'Good','Pending','2026-04-02 17:03:46','2026-04-02 17:03:46',NULL);
