CREATE DATABASE picture_this;
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    username VARCHAR(50) NOT NULL,
    hash VARCHAR(100) NOT NULL,
    language VARCHAR(10)
);
CREATE TABLE rooms (
    name VARCHAR(50) PRIMARY KEY,
    created_at VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    high_score INT DEFAULT 0,
    FOREIGN KEY (created_by) REFERENCES users (id)
);
CREATE TABLE sio_connected_clients (
    user_id INT NOT NULL,
    room_name VARCHAR(50) NOT NULL,
    user_language VARCHAR(50),
	sid VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users (id),
	FOREIGN KEY (room_name) REFERENCES rooms (name),
    PRIMARY KEY (user_id, room_name)
);
CREATE TABLE words 
(
	id INT PRIMARY KEY AUTO_INCREMENT,
    word	VARCHAR(512),
    points	INT
);