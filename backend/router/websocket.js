import cookie from 'cookie'
import secret from './configuration/secret.js';
import jwt from 'jsonwebtoken';
import crypto, { randomUUID } from 'crypto';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';
import { edenai_bearer } from '../configuration/secret.js';
import { increaseCompetitivesWon, increaseCooperativePlayed, increaseRoundsWon, increaseVotesGotten } from './database/profiles.js';


const lobbies = {};
const sockets = {};

export default async (socket) => {


    var cookief = socket.handshake.headers.cookie;
    if(!cookief){
        console.log("SOMEBODY IS DISCONNECTED, NO COOKIES")
        return socket.disconnect();
        
    }
    var cookies = cookie.parse(socket.handshake.headers.cookie); 
    let username = '';
    let lobby_id = '';
    let lobby;
    let results = [];
    try{
        username = jwt.verify(cookies.JwtToken, secret).username;
    }
    catch(err){
        console.log("SOMEBODY IS DISCONNECTED BECAUSE NO AUTHENTIFICATION", err)
        return socket.disconnect();
    }

    if (sockets[username]){
        return socket.disconnect();
    }

    socket.on('create lobby', () =>{
        lobby_id = crypto.randomUUID().slice(0, 6);
        socket.join(lobby_id);
        lobbies[lobby_id] = {users: [username], admin: username, state: 'lobby', images: {}, current_index: 0, words: {}, points: {}, objects: {}, gameMode: 'versus'};
        lobbies[lobby_id].points[username] = 0
        io.to(lobby_id).emit("joined lobby", lobbies[lobby_id].users);
        socket.emit('lobby id', lobby_id);
        lobby = lobbies[lobby_id];
        console.log(`${username} created lobby ${lobby_id}, ${lobbies}`);
    });

    socket.on('join lobby', (join_lobby_id) => {
        if(!(join_lobby_id in lobbies)){
            console.log(join_lobby_id, "not in", lobbies)
            return;
        }

        if(lobbies[join_lobby_id].state !== 'lobby'){
            console.log(join_lobby_id, "state of game is not lobby")
            return;
        }

        lobby_id = join_lobby_id;
        lobby = lobbies[join_lobby_id];
        socket.join(join_lobby_id); 
        lobbies[join_lobby_id].users.push(username);
        lobbies[join_lobby_id].points[username] = 0
        io.to(join_lobby_id).emit('joined lobby', lobbies[join_lobby_id].users);
    });

    socket.on('set game mode', gameMode => {
        if (username !== lobby?.admin || lobby?.state !== 'lobby'){
            return;
        }

        lobby.gameMode = gameMode;
    })

    socket.on('disconnect', (reason) => {
        delete sockets[username];

        if (lobby_id !== '') {
            if(!lobbies[lobby_id]){
                return
            }

            lobbies[lobby_id].users = lobbies[lobby_id].users.filter(item => item !== username)
            
            if(lobbies[lobby_id].state === 'lobby'){
                io.to(lobby_id).emit('joined lobby', lobbies[lobby_id].users);
            }
            if (lobbies[lobby_id].users.length === 0){
                delete lobbies[lobby_id];
            }
            else if(lobbies[lobby_id].admin === username && lobbies[lobby_id].state == 'lobby'){
               io.to(lobby_id).emit('lobby closed');
               delete lobbies[lobby_id];
            }
        }
        
    })

    socket.on('start game', () => {
        if(lobby?.admin !== username){
            return
        }

        io.to(lobby_id).emit('game started')
        if(lobby?.gameMode === 'Cooperative'){
            for(const user of lobby.users){
                if(user !== lobby.admin){
                    sockets[user].emit('waiting for host');
                }
                increaseCooperativePlayed(user);
            }
        }
    })

    socket.on('upload image', async (payload) => {
        const image = payload.file;
        const imageURL = payload.fileURL;
        if(!image || !imageURL || !lobby){
            return;
        }

        const form = new FormData();
        form.append("providers", 'clarifai');

        const file = fs.ReadStream.from(image)
        form.append("file", file, {filename: 'image.jpg', contentType: 'jpg'});

        const resp = await fetch(
            `https://api.edenai.run/v2/image/object_detection`,
            {
              method: 'POST',
              headers: {
                Authorization: edenai_bearer,
                'Content-Type': 'multipart/form-data; boundary=' + form.getBoundary()
            },
              body: form
            }
          );
        

        const data = await resp.json();
        const appareances = {}
        results = data.clarifai.items;

        if(lobby?.gameMode === 'Cooperative'){
            if(results.length < lobby.users.legnth) {
                return; //TODO: emit here that someone is drawingXD
            }
            results.sort((a, b) => b.confidence - a.confidence);
            lobby.coopObjects = {}
            for(const i in lobby.users){
                lobby.coopObjects[lobby.users[i]] = results[i]
            }
            for(const user of lobby.users){
                console.log(sockets[user]);
                sockets[user].emit('your username', user)
                sockets[user].emit('your word', lobby.coopObjects[user].label)
            }
            io.to(lobby_id).emit('coop draw time', {"objects": lobby.coopObjects, "image": imageURL});
            return;
        }

        
        data.clarifai.items.forEach(element => {
            if(!(element.label in appareances)){
                appareances[element.label] = 0
            }
            
            appareances[element.label]++;
        });
        
        lobbies[lobby_id].images[username] = imageURL;
        socket.emit('select word', JSON.stringify(appareances))
    });

    socket.on('word selected', word => {
        lobbies[lobby_id].words[username] = word;
        lobbies[lobby_id].objects[username] = results.filter(result => result.label === word);

        if(Object.keys(lobby.words).length == lobby.users.length){
            const user = lobby.users[lobby.current_index];
            io.to(lobby_id).emit('draw', {image: lobby.images[user], word: lobby.words[user], objects: lobby.objects[user]})
        }
    })

    let voted = false;
    socket.on('submit drawing', drawing => {
        if(!lobby.currentImages){
            lobby.currentImages = {};
        }
        voted = false;
        lobby.currentImages[username] = {'drawing': drawing, 'UUID': crypto.randomUUID()}

        if (Object.entries(lobby.currentImages).length == lobby.users.length){
            console.log("Everybody submitted image");
            lobby.voteNumbers = {}
            for(const user of lobby.users){
                lobby.voteNumbers[user] = 0;
            }

            for(const user of lobby.users){
                const arrImages = [];
                for(const key of lobby.users){
                    if(key !== user){
                        arrImages.push(lobby.currentImages[key])
                    }
                }
                sockets[user].emit('vote', arrImages)
            }
        }
    })

    
    socket.on('vote', voteUUID => {
        if(voted || !voteUUID){
            return
        }
        for(const user of lobby.users){
            if(lobby.currentImages[user].UUID == voteUUID){
                console.log(user, 'got voted on' )
                lobby.voteNumbers[user]++;
                increaseVotesGotten(user);
                voted = true;
                socket.emit('vote ok')
            }
        }
        if(Object.values(lobby.voteNumbers).reduce((a, b) => a + b, 0) == lobby.users.length){
            console.log("EVERYBODY VOTED")
            let vote_results = [];
            for(const user in lobby.voteNumbers){
                vote_results.push([user, lobby.voteNumbers[user]]);
            }
            

            vote_results.sort((a, b) => b[1] - a[1]);
            const maxi = vote_results[0][1];
            for(const vote_res of vote_results){
                if(vote_res[1] == maxi){
                    console.log('before', lobby.points)
                    lobby.points[vote_res[0]]++;
                    increaseRoundsWon(vote_res[0]);
                    io.to(lobby_id).emit('gained point', vote_res[0]);
                    console.log('after', lobby.points)
                }
            }
            io.to(lobby_id).emit('vote results', vote_results);
        }
    })

    socket.on('coop drawing move', file_url => {
        io.to(lobby_id).emit('coop drawing move', {"user": username, "file": file_url});
    });

    socket.on('start next round', () => {
        if (username != lobby.admin){
            return
        }

        lobby.current_index++;
        lobby.currentImages = {};
        if (lobby.current_index < lobby.users.length){
            const user = lobby.users[lobby.current_index];
            io.to(lobby_id).emit('draw', {image: lobby.images[user], word: lobby.words[user], objects: lobby.objects[user]})
        }
        else{
            console.log(...Object.values(lobby.points))
            const max_points = Math.max(...Object.values(lobby.points));
            const winners = [];
            
            for(const user of Object.keys(lobby.points)){
                console.log(user)
                if(lobby.points[user] == max_points){
                    winners.push(user);
                    increaseCompetitivesWon(user);
                }
            }
            console.log(winners, lobby.points, max_points);
            io.to(lobby_id).emit('game end', winners);
        }
    })

    socket.on('submit drawing coop', file => {
        io.to(lobby_id).emit('coop ended', file)
    })

    sockets[username] = socket;

    socket.emit('set username', username);
}