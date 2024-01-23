import { useState } from "react"
import { Link} from "react-router-dom"

async function resetPassword(credentials) {
    const res = await fetch('http://localhost:80/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)

    })
    return res.status;
}

export default function ResetPassword(){
    const [email, setEmail] = useState('')
    // const [message, setMessage] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        const status = await resetPassword({
          email
        });
        console.log(status);
        if(status >= 200 && status <300){
            console.log("HOORAY");
        }
      }

    return <div className="formHolder">
        <p>Password reset</p>
        <label htmlFor="email" >Email: </label>
        <input type="text" name="email" onChange={e => setEmail(e.target.value)}></input>
        <br/>
        <button onClick={e => handleSubmit(e)}>Send password reset email</button><br/>
        <Link to="../login">Login page</Link>
        <Link to="../signup" className="link2">Signup page</Link>
    </div>
}