# About Project
A drawing party game which is based on object detection. The game has two game modes:
  - Competitive: Players have to draw something as creative/funny as possible, the funniest wins.
  - Cooperation: Everybody draws on the same photo, instead of different objects. This is for making memorable photos more interesting, together.

## Competitive mode

### Uploading phase

Every player uploads an image, and chooses a word that was detected on the image. 
> <p>
>    <image src='/images/garden_gnomes.jpg' height="355px"/>
>    <image src='/images/word_for_garden_gnomes.png' height="355px"/>
> </p>
> </table>
> If the user uploads the photo with the gnomes, these are the objects that were recognized (for example 3 human faces).

### Drawing phase
In a game round every player gets the same image, with the chosen detected objects cut out from the original picture. 


> <image src="/images/screenshots/competitive.png" width="800px"/><br>
> For example, from the image there are 3 human faces cut out. The player has to draw in the green box on the right, the drawing is then put back at the spots where the faces were cut out from.

### Voting phase
After every player has finished their drawing, the voing phase begins. Every player has to choose one of the other players' artwork, which is the most funny/creative. The player with the most votes gets a point.

> 

### Game end
After every players' image-word combo was played through, the competitor with the most points is deemed victorious.

## Cooperative mode

I cooperative mode the loby creator uploads an image, and every player has to draw instead of a different object.

> <img src=""

# Functionalities
- **Lobby**: players could create lobbies, the lobby creator can change the game mode.
- **Drawing board**: Made with Canvas API for responsiveness, if users wanted they could upload a photo to the drawing board first, then do some finishing touches in the drawing board.
- **Auth**: sign-up, login,sign-out, forgot password (email sent with one-use link). The WebSocket (WS) was only created after the user signed in, the authentication for the WS connection was made during the handshake phase, a JWT token was saved in the user's cookies.
- **Automatic login**: if someone has already logged in (and didn't sign out), the user skipped the log in page and went to the main page automatically
- **Voting**: players could vote, also could see a zoomed in version of the image (made with Modals).




# Setup
## Installing dependencies
In backend folder run: ```npm i```.  
In frontend folder run: ```npm i```.

## Settings up backend/config/secrets.js
Set up a MongoDB database somwehere in the web,

# Run project
In backend folder run: ```node index```.  
In frontend folder run: ```npm run start```.
