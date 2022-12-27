CREATE DATABASE picture_this;
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    username VARCHAR(50) NOT NULL,
    hash VARCHAR(100) NOT NULL
);
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users (id)
);
CREATE TABLE room_members (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    room_id INT NOT NULL,
    member_id INT NOT NULL,
    is_room_admin BOOLEAN, 
    added_at VARCHAR(50) NOT NULL,
    added_by VARCHAR(50) NOT NULL,
    FOREIGN KEY (member_id) REFERENCES users (id),
    FOREIGN KEY (room_id) REFERENCES rooms (id)
);