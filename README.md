# PICTURE THIS
#### Link: https://www.ilpicturethis.com
#### Video Demo:  https://youtu.be/GhMMDZL_hoI
#### Description:
--A web based quick-draw/guessing game app for 2 players built with the Flask framework.

--The first player starts the game by choosing a difficulty level (easy, medium, hard). Then the first player selects one of 10 words (randomly pulled from the word table in the database). Then they will try to draw the word’s meaning. 
While drawing, the second player will see the drawing and will try to guess the word. Once succeeded, they will get to pick a new word, draw it, and so on. 
--Rules: 
-The first player who starts the game will have to wait for the second player to join. 
-Players can guess as many times they want within a 90 second window. After that, the timer will time out and automatically switch the player's views.
--When guessing correct, the game session will earn points: 
Easy word - 1 point, Medium word - 3 points, Hard word - 5 points 

#### Interesting Features:

### Two Way Communication
In the frontend, I was able to implement socketio for sending and receiving data (rooms/static/js/socketio.js).
On the backend, I was thankful that the flask-socketio library existed and is handling the distribution of the data between clients in a given room.
When a user enters a room, a socket id is generated and then saved to a table in the database to keep track of how many users are in a room. Once there are 2 users in a room, that room is no longer available to join and a different room needs to be selected or created. On leaving the page or logout, the client record is deleted from the table.

### Creating the word bank
-- When there are two players logged in and they both enter a gameroom,
player 1 chooses a difficulty level and then gets a choice of 10 random words at that level.
To implement this, I searched the web for a list of words that could fit the bill. All I was able to find was a website that generated a list and showed it on the screen in text format. So I copied the words into 3 txt files (one for each difficulty level). 
I wrote a Python script (found in mysql/words/words_csv.py) to read the words, and write them into a csv file (mysql/words/words.csv).
Since AWS RDS database does not support the upload of csv files, I used an online file converter to generate an SQL script from the csv, and then I ran that script (mysql/words/words.sql) in MySQL.

### Translations
-- I selected 5 languages for the app based on my social network.
-- The front end is using the i18next library to translate all string literals.
The user has the choice to change the language at anytime before he/she reaches the gameroom. That preferred language also gets stored in the user record in the db.
-- In the backend, I simple created a Python script that uses a dictionary of dictionaries to reference all the string literals (static/translations.py).
-- More interestingly, if two users were using different languages, how could I verify that player2 correctly guessed the word that player1 was drawing? So I created my own translate function that uses a free Python library for translating strings from one language to another. Unfortunatley, sometimes things get lost in translation, but the user does get informed of what the correct guess should have been once the time runs out.

### The Drawable Canvas
I created a reusable class for the canvas so that a new instance could be created, sent, and received with each movement of the cursor for delivering a "realtime" effect (rooms/static/js/canvas.js).

### Voice Messaging
I wanted the users to be able to send voice messages to each other during game play to give a more personal feel to the experience.
I'm using the MediaRecorder API (rooms/static/js/mic.js) for recording the microphone track, and the Web Audio API for generating the sound for the receiving player. 
I was able bypass the user interaction requirement for mobile devices by playing 500ms of silence on the click of the enable sound button. 
It all works perfectly on the desktop. However, I found that on ios mobile safari, when the mic is enabled, audio will only play through the receiver speaker. It is not possible to change this with the Web Audio API despite many attempts at finding a work around.
This the one part of the project that is still in progress.

### Database
I'm using AWS RDS to host a MySql database with only 4 tables (mysql/schema.sql): 
--users -> records username, hash, and preferred language 
--socketio_connected_clients -> records user_id, room_name, and socketId
--rooms -> records room_name, creation_time, created_by, and high score for the room
--words -> records word, and point_value of the word

#### Challenges along the way
To my dismay, Heroku announced they are no longer hosting apps for free. I needed an alternative. Since I've seen a trend in companies using AWS, I decided to research how I could get the app hosted with their free tier.
-- after realizing that AWS does not support flask-socketio, I needed a solution and found that if I dockerize my app, it would work in AWS. So I had to learn how to implement Docker. 
-- I am using AWS Elastic Beanstalk for hosting, but saw that the websocket functionality wasn't working because the website wasn't secure, so I had to go get a domain name, get a security certificate, and register it to the app.
-- Now I am able to deploy updates through the Elastic Beanstalk CLI, but I think I will soon switch to the Code Pipeline that AWS provides.

#### Design and Architecture
--The app's design is modeled after Pictionary's design.
--I created the branding that is always seen in the navbar, and also featured in the
intro page after login. 
--I'm using Bootstrap5 for a lot of the styling including the collapsable navbar. Many of the styles are overwritten with media queries for different size screens.
--Application.py is the root file for running the app and uses an index page for   elements common to every page in the app. After login, the app redirects to the intro page.
--I'm using Flask Blueprints to separate the backend logic into sections: 
    auth.py for registering and logging in users
    rooms.py for the gameroom logic which includes the view_room page, join_room page, and create_room page
--In 5 out of 6 the HTML templates I'm using, the pages are being rendered by Flask with a sprinkling of Javascript involvement. 
Once the gameroom is reached (rooms/templates/view_room.html), the page is altered with mostly reusable components similar to a single page application, all written in Javascript (rooms/static/js/components.js).