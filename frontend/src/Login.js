import { useState } from "react"
import { useSelector, useDispatch } from "react-redux";
import { Link, Navigate } from "react-router-dom"
import { setIsLoggedIn } from "./redux/logicSlice";
import "./Login.css"


async function loginUser(credentials) {
    const res = await fetch('http://localhost:80/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials)
    })
    return res.status;
}


export default function Login(){
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(state => state.gameState.isLoggedIn);

    const handleSubmit = async e => {
        console.log(isLoggedIn);
        e.preventDefault();
        const status = await loginUser({
          username,
          password
        });
        console.log(status);
        if(status >= 200 && status < 300){
          dispatch(setIsLoggedIn());
        }
        //TODO: add login before everything
      }

      //TODO: add here the go back to lobby if there was a lobby link?

    return (isLoggedIn ? <Navigate to="/"/> : <div className="formHolder">
        <form>
            <p>Login</p>

            <label htmlFor="username">Username: </label>
            <input type="text" name="username" onChange={(e) => setUsername(e.target.value)}/>

            
            <br/>

            <label htmlFor="password">  Password: </label>
            <input type="password" name="password" id="inputPassword" onChange={e => setPassword(e.target.value)}/>
            <br/>
            <button onClick={e => handleSubmit(e)}>Log in</button>
        </form>
        <Link to="../signup">Signup page</Link>
        <Link to="../reset-password" className="link2">Reset password</Link>
    </div>)
}