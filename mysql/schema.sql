CREATE DATABASE picture_this;
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    username VARCHAR(50) NOT NULL,
    hash VARCHAR(100) NOT NULL
);
CREATE TABLE rooms (
    name VARCHAR(50) PRIMARY KEY,
    created_at VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users (id)
);
CREATE TABLE sketches (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    created_at VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    room_name VARCHAR(50) NOT NULL,
    dataUrl VARCHAR(2083) NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users (id),
    FOREIGN KEY (room_name) REFERENCES rooms (name)
);
CREATE TABLE sio_connected_clients (
    user_id INT NOT NULL,
    room_name VARCHAR(50) NOT NULL,
	sid VARCHAR(50),
    score INT,
    FOREIGN KEY (user_id) REFERENCES users (id),
	FOREIGN KEY (room_name) REFERENCES rooms (name),
    PRIMARY KEY (user_id, room_name)
);