import { Link, Navigate } from "react-router-dom"
import { useState } from "react";

async function signupUser(credentials) {
    const res = await fetch('http://localhost:80/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    return res.status;
}

export default function Signup(){
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [wasSuccessful, setWasSuccessful] = useState(false)

    const handleSubmit = async e => {
        e.preventDefault();
        const status = await signupUser({
          username,
          password,
          email
        });
        console.log(status);
        if(status >= 200 && status <300){
            console.log("HOORAY");
            setWasSuccessful(true);
        }
        //TODO: add login before everything
      }

    return (wasSuccessful ? <Navigate to='/login'/>:<div className="formHolder">
        <p>Sign up</p>
        <form>
            <label htmlFor="username">Username: </label>
            <input type="text" name="username" onChange={(e) => setUsername(e.target.value)}/>
            <br/>
            <label htmlFor="email">Email: </label>
            <input id="inputEmail" type="text" name="email" onChange={e => setEmail(e.target.value)}/>
            <br/>
            <label htmlFor="password">Password: </label>
            <input id="inputPassword" type="password" name="password" onChange={e => setPassword(e.target.value)}/>
            <br/>
            <button onClick={e => handleSubmit(e)}>Sign up</button>
        </form>
        <Link to="../login">Login page</Link>
        <Link to="../reset-password" className="link2">Reset password</Link>
    </div>)
}