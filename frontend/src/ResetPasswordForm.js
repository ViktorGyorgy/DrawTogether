import { useState } from "react";
import { useParams} from "react-router-dom"

async function resetPassword(credentials) {
    const res = await fetch('http://localhost:80/api/reset-password/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    return res.status;
}

export default function ResetPasswordForm(){
    const {id} = useParams();
    console.log(id);
    const [password1, setPassword1] = useState('')
    const [password2, setPassword2] = useState('')

    const handleSubmit = async e => {
        e.preventDefault();
        const status = await resetPassword({
          password1,
          password2,
          'code': id
        });
        console.log(status);
        if(status >= 200 && status <300){
            console.log("HOORAY");
        }
        //TODO: add login before everything
      }

    return <div className="formHolder">
        <p>Password Reset Form</p>
        <label htmlFor="email" >New password: </label>
        <input type="password" name="password" id="inputNewPassword" onChange={e => setPassword1(e.target.value)}></input>
        <br/>
        <label htmlFor="email" >Repeat password: </label>
        <input type="password" name="password2" onChange={e => setPassword2(e.target.value)}></input>
        <br/>
        <button onClick={handleSubmit}>Set Password</button>
        <br/>
    </div>
}