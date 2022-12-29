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
    user_id INT NOT NULL,
    room_id INT NOT NULL,
    is_room_admin BOOLEAN, 
    added_at VARCHAR(50) NOT NULL,
    added_by INT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES rooms (id)
    FOREIGN KEY (user_id) REFERENCES users (id)
    FOREIGN KEY (added_by) REFERENCES users (id)
);
CREATE TABLE sketches (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    created_at VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    room_id VARCHAR(50) NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users (id),
    FOREIGN KEY (room_id) REFERENCES rooms (id)
);