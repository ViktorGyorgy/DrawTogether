# About the project
A drawing party game which is based on object detection. The game has two game modes:
  - Competitive: Players must choose an image and replace certain objects on it with their own drawings. The creation voted as the funniest by other players wins.
  - Cooperative: everybody draws on the same canvas instead of different environments. This game mode is for making memorable photos more interesting together.

## Competitive mode

### Uploading phase

Every player uploads an image, and chooses a word from a list of entities detected on the image. 
> <p>
>    <image src='/images/garden_gnomes.jpg' height="355px"/>
>    <image src='/images/word_for_garden_gnomes.png' height="355px"/>
> </p>
> </table>
> If the user uploads the photo with the gnomes, these are the objects that were recognized (for example 3 human faces).

### Drawing phase
In a game round every player gets the same image, with the chosen detected objects cut out from the original picture. 


> <image src="/images/screenshots/competitive.png" width="800px"/><br>
> In this image there are 3 human faces cut out. The player has to create a drawing in the green box on the right, which will serve as a replacement for the human faces on the original image.

### Voting phase

After every player has finished their drawing, the voting phase begins. Each player has to choose one of the other players' artwork, which is the most funny/creative. The player with the most votes gets a point.

> <p>
>   <img src="/images/screenshots/voting.png" height="280x">
>   <img src="/images/screenshots/voting_modal.png" height="280px">
> </p>
> First image: player can vote on one of the images which were modified by the other players. <br>
> Second image: if the player clicks on one of the images, it will be opened in a bigger size (to see the details better), with the help of a Modal.


### Game end
After every players' image-word combo was played through, the competitor with the most points is victorious.

## Cooperative mode

In cooperative mode, the lobby creator uploads an image, and every player has to draw instead of a different object. The game is ended when the host presses the finish drawing button.

> <img src="/images/screenshots/cooperative.png" width="800px">
> Here the player has to draw something instead of a houseplant. The image is updated with the other players' drawing (someone drew a teddy bear in the mean time).

# Other functionalities
- **Lobby**: in lobbies game type can be changed, the lobby creator can change it only.
- **Drawing pad**: the drawing cursor's size can be changed using the mouse wheel. It is possible to upload a photo of a drawing and do the finishing touches in the game.
- **Object detection**: for this purpose integrated Eden AI's API. 
- **Authentication**: sign-up, login, sign-out, reset password. At password reset a single-use link is sent to their email address. If an user signed in in the last 24 hours, they will skip the login page.
- **Authorization**: the user can see some stats about himself (how many games they played). Every player can see only their stats.

# Decisions for the project
- Market research: checked if there are low-cost object detection APIs, and how good they are (if they recognize enough objects to have an interesting game).
- For real time communication used Socket.io, a WebSocket library with event driven design.
- For real time update used React, and to modularize the game states created a single-page application with the help of React Router (also didn't have to reopen the WebSocket connection at every page reload).
- For the drawing pad reused a simple HTML project that I did a year earlier.
- Beacuse the drawings weren't noticeable on the resulting images, the entities were cut out from the original image.

# What I would do different if had to create now
- Would use hot reload instead of live reload, so that the states are not lost, and it is easier to test and design the webpage of it.
- Would set up a linter at the start of the project.
- Different production profiles for better testability.

# Setup
## Installing dependencies
In backend folder run: ```npm i```.  
In frontend folder run: ```npm i```.

## Settings up backend/config/secrets.js
Write a random hash for passwords. <br>
Set up a MongoDB database (I had it in MongoDB Atlas), and insert the connect URI. The database name can be changed in the config file.<br>
Create Eden AI account, insert Bearer code. New accounts get enough funding for processing around 10_000 images. <br>

# Run project
In backend folder run: ```node index```.  
In frontend folder run: ```npm run start```.
