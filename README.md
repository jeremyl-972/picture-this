# picture-this
A quick-draw/guessing game app

Build a ‘Draw & Guess’ game for 2 players. 

The game includes 5 views: 
Welcome view 
Word choosing view 
Drawing view 
Guessing view (reuse of drawing view with an input for entering the word) 
Waiting view 

The first player starts the game by choosing between 3 given words, words vocabulary is provided below (easy, medium, hard), then he will try to draw the word’s meaning. 
When clicking send, the second player will see the drawing and will try to guess the word. Once succeeded, he will get to pick a new word, draw it, and so on. 
Rules: The first player who starts the game will have to wait for the second player to join (refresh at both tabs for starting a new game). Players can guess as many times they want. 
When guessing right, the game session will earn points: 
Easy word - 1 point, Medium word - 3 points, Hard word - 5 points 

General Requirements: 
Use any language/framework you’d want. The communication doesn’t have to be in real-time (streaming), simple server with “healthCheck” route can be enough. Choose any way you want to pass/save the drawing to the other player. (probably canvas) The game needs to be adjusted only for mobile devices. 

Bonus: Use DB for saving the sessions and show the best session score in welcome screen. (The best session score is the highest score for minimum time played) Extra Bonus: Show to the guessing player a ‘video’ of the incoming drawing - for example, save the timeframes for each drawn pixel to restore the exact movements after.
