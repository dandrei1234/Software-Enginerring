CREATE TABLE `audit_log_tbl` (
  `logID` int NOT NULL AUTO_INCREMENT,
  `userID` int DEFAULT NULL,
  `action_type` varchar(100) DEFAULT NULL,
  `action_details` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`logID`),
  KEY `userID` (`userID`),
  CONSTRAINT `audit_log_tbl_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users_tbl` (`userID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=206 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `equipment_category_tbl` (
  `categoryID` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`categoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `equipment_tbl` (
  `equipmentID` int NOT NULL AUTO_INCREMENT,
  `categoryID` int DEFAULT NULL,
  `equipment_name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`equipmentID`),
  KEY `categoryID` (`categoryID`),
  CONSTRAINT `equipment_tbl_ibfk_1` FOREIGN KEY (`categoryID`) REFERENCES `equipment_category_tbl` (`categoryID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `rental_items_tbl` (
  `itemID` int NOT NULL AUTO_INCREMENT,
  `equipmentID` int NOT NULL,
  `total_quantity` int DEFAULT '1',
  `available_quantity` int DEFAULT '1',
  PRIMARY KEY (`itemID`),
  KEY `equipmentID` (`equipmentID`),
  CONSTRAINT `rental_items_tbl_ibfk_1` FOREIGN KEY (`equipmentID`) REFERENCES `equipment_tbl` (`equipmentID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `rentals_tbl` (
  `rentalID` int NOT NULL AUTO_INCREMENT,
  `itemID` int DEFAULT NULL,
  `userID` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `condition_status` enum('New','Good','Fair','Damaged') DEFAULT 'Good',
  `borrow_status` enum('Pending','Approved','Returned','Overdue','Rejected') DEFAULT 'Pending',
  `request_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `due_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `return_date` datetime DEFAULT NULL,
  PRIMARY KEY (`rentalID`),
  KEY `itemID` (`itemID`),
  KEY `userID` (`userID`),
  CONSTRAINT `rentals_tbl_ibfk_1` FOREIGN KEY (`itemID`) REFERENCES `rental_items_tbl` (`itemID`) ON DELETE CASCADE,
  CONSTRAINT `rentals_tbl_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `users_tbl` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users_tbl` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('student','staff') NOT NULL DEFAULT 'student',
  `password` varchar(255) NOT NULL,
  `registration_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

