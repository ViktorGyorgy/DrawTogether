import { useState } from 'react';
import { setAdmin, setGamePhase, setLoggedOut, setPage, setUsername, socket } from './redux/logicSlice';
import Game from './Game';
import { useDispatch, useSelector } from 'react-redux';

let stats;

export default function Home(){
    const page = useSelector(state => state.gameState.page)
    const isAdmin = useSelector(state => state.gameState.isAdmin)
    const [players, setPlayers] = useState([]);
    const [lobbyId, setLobbyId] = useState('');
    const username = useSelector(state => state.gameState.username)
    const dispatch = useDispatch()

    const createLobby = () => {
        dispatch(setAdmin(true));
        socket.emit('create lobby');
        socket.once('lobby id', (myLobbyId) => setLobbyId(myLobbyId))
    }

    const joinLobby = () => {
        dispatch(setAdmin(false));
        socket.emit('join lobby', lobbyId);
    }

    socket.on("joined lobby", (players) => {
        dispatch(setPage('lobby'))
        setPlayers(players);
    });

    socket.on('game started', () => {
        dispatch(setPage('game'));
        dispatch(setGamePhase('upload image'))
    })

    const signOut = async () => {
        const resp = await  fetch('http://localhost:80/api/signout', {
            method: 'POST',
            credentials: 'include'
          });
        dispatch(setLoggedOut());
        console.log("XDDD")
    }

    const goToProfile = async () => {
        const resp = await  fetch(`http://localhost:80/api/profiles/${username}`, {
            method: 'GET',
            credentials: 'include'
          });
        if(resp.status === 200){
            stats = await resp.json()
            console.log(stats)
        
            dispatch(setPage('profile'))
        }
    }

    socket.on('set username', username1 => {
        console.log(username1)
        dispatch(setUsername(username1))
    })

    if (page === ""){
        return (<div className='main'><nav><button onClick={signOut}>Sign out</button><div className='vr'/><button onClick={goToProfile}>{username}</button></nav>
        <div className="formHolder">
            <button onClick={createLobby}>create lobby</button>
            <br/>
            <input type="text" className='lobbyInput' onChange={e => setLobbyId(e.target.value)}></input>
            <br/>
            <button onClick={joinLobby}>join lobby</button>
        </div></div>)
    }

    if (page === "lobby") {
        return (
        <div className="formHolder lobbyDiv">
            <p>Lobby {lobbyId}</p>
            <p>Players:</p>
            <ul>
                {players.map(player => <li key={player}>{player}</li>)}
            </ul>
            
            <select id="cars" name="gameMode" disabled={!isAdmin} onChange={e => socket.emit('set game mode', e.target.value)}>
                <option value="Versus">Versus</option>
                <option value="Cooperative">Cooperative</option>
            </select>
            <br/>
            {isAdmin ? <button onClick={() => socket.emit('start game')}>Start</button> : <button disabled>Start</button>}
        </div>)
    }


    if(page=== "profile"){
        return <div className='main'><nav><button onClick={signOut}>Sign out</button><div className='vr'/><button onClick={() => dispatch(setPage(''))}>Home page</button></nav>
            <div className='formHolder profileDiv'>
                <p className='usernameP'>{username}</p>
                <p>Competitive games won: {stats.competitiveWon}</p>
                <p>Rounds won: {stats.roundsWon}</p>
                <p>Votes received: {stats.votesGotten}</p>
                <p>Cooperative games played: {stats.cooperativePlayed}</p>
            </div>
        </div>
    }
    else if (page === "game"){
        return <Game/>
    }

    
}