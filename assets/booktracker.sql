/*
This script creates the database for the book tracking app I am creating. 
Author: Isaiah Lee
Version: 1.00
*/

CREATE TABLE books (
    book_id int NOT NULL AUTO_INCREMENT, 
    book_title varchar(255), 
    page_count int, 
    genre varchar(255),
    PRIMARY KEY (book_id)
);

CREATE TABLE authors (
    author_id int NOT NULL AUTO_INCREMENT, 
    first_name varchar(255), 
    last_name varchar(255), 
    PRIMARY KEY (author_id)
);

CREATE TABLE book_authors (
    book_author_id int NOT NULL AUTO_INCREMENT,
    book_id int NOT NULL, 
    author_id int NOT NULL, 
    PRIMARY KEY (book_author_id), 
    FOREIGN KEY (book_id) REFERENCES books(book_id), 
    FOREIGN KEY (author_id) REFERENCES authors(author_id)
);

CREATE TABLE users (
    user_id int NOT NULL AUTO_INCREMENT, 
    first_name varchar(255), 
    last_name varchar(255), 
    username varchar(255), 
    password varchar(255),
    PRIMARY KEY (user_id)
);

CREATE TABLE book_readings (
    book_reading_id int NOT NULL AUTO_INCREMENT, 
    book_id int NOT NULL, 
    user_id int NOT NULL, 
    rating int, 
    year_of_reading date, 
    PRIMARY KEY (book_reading_id), 
    FOREIGN KEY (book_id) REFERENCES books(book_id), 
    FOREIGN KEY (user_id) REFERENCES users(user_id), 
    CONSTRAINT CHK_rating CHECK (rating >= 1 AND rating <= 10)
);

CREATE TABLE groups (
    group_id int NOT NULL AUTO_INCREMENT, 
    group_name varchar(255), 
    meeting_time datetime, 
    PRIMARY KEY (group_id)
);  

CREATE TABLE group_members (
    group_member_id int NOT NULL AUTO_INCREMENT, 
    group_id int NOT NULL, 
    user_id int NOT NULL, 
    user_role varchar(6), 
    PRIMARY KEY (group_member_id), 
    FOREIGN KEY (group_id) REFERENCES groups(group_id), 
    FOREIGN KEY (user_id) REFERENCES users(user_id), 
    CONSTRAINT CHK_user_role CHECK (user_role = 'member' OR user_role = 'leader')
);

CREATE TABLE group_books (
    group_book_id int NOT NULL AUTO_INCREMENT, 
    group_id int NOT NULL, 
    book_id int NOT NULL, 
    date_started date, 
    date_finished date, 
    target_date_finished date, 
    PRIMARY KEY (group_book_id), 
    FOREIGN KEY (group_id) REFERENCES groups(group_id), 
    FOREIGN KEY (book_id) REFERENCES books(book_id) 
);

CREATE TABLE group_messages (
    message_id int NOT NULL AUTO_INCREMENT, 
    group_member_id int NOT NULL, 
    message_details varchar(255), 
    PRIMARY KEY (message_id), 
    FOREIGN KEY (group_member_id) REFERENCES group_members(group_member_id)
);

CREATE TABLE friendships (
    friendship_id int NOT NULL AUTO_INCREMENT, 
    sending_user_id int NOT NULL, 
    receiving_user_id int NOT NULL, 
    date_sent date, 
    date_accepted date, 
    request_status varchar(8), 
    PRIMARY KEY (friendship_id), 
    FOREIGN KEY (sending_user_id) REFERENCES users(user_id), 
    FOREIGN KEY (receiving_user_id) REFERENCES users(user_id), 
    CONSTRAINT CHK_request_status CHECK (request_status = 'ACCEPTED' OR request_status = 'PENDING')
);