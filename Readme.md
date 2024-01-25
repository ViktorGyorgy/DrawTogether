# About Project
A drawing party game which is based on object detection. The game has two game modes:
  - Competitive: Players have to draw something as creative/funny as possible, the funniest wins.
  - Cooperation: Everybody draws on the same photo, instead of different objects. This is for making memorable photos more interesting, together.

## Competitive mode
<table>
  <th>
    <image src='/images/garden_gnomes.jpg' height="350px">
    <image src='/images/word_for_garden_gnomes.png' height="350px">
  </th>
</table>

## Cooperative mode

# Functionalities
- **Lobby**: players could create lobbies, the lobby creator can change the game mode.
- **Drawing board**: Made with Canvas API for responsiveness, if users wanted they could upload a photo to the drawing board first, then do some finishing touches in the drawing board.
- **Auth**: sign-up, login,sign-out, forgot password (email sent with one-use link). The WebSocket (WS) was only created after the user signed in, the authentication for the WS connection was made during the handshake phase, a JWT token was saved in the user's cookies.
- **Automatic login**: if someone has already logged in (and didn't sign out), the user skipped the log in page and went to the main page automatically
- **Voting**: players could vote, also could see a zoomed in version of the image (made with Modals).


# Tech Stack
## Node.js, Express.js MongoDB, JWT



## Socket.io + React Router
To make the WebSocket connection persistent, and modularize the different game states, made a Single Page Application with the help of React Router.



# Setup
## Installing dependencies
In backend folder run: ```npm i```.\
In frontend folder run: ```npm i```.

## Settings up backend/config/secrets.js


# Run project
In backend folder run: ```node index```.\
In frontend folder run: ```npm run start```.
