import './App.css';
import { useDispatch } from 'react-redux'
import {
  Routes,
  Route
} from "react-router-dom";
import { useEffect } from 'react';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import PrivateRoute from './PrivateRoute';
import { setIsLoggedIn } from './redux/logicSlice';
import ResetPassword from './ResetPassword';
import ResetPasswordForm from './ResetPasswordForm';

function App() {
  const dispatch = useDispatch();

  async function checkInitialCookies(){
    try {
      const res = await fetch('http://localhost:80/api/login', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
        })
        if (res.status === 200){
          dispatch(setIsLoggedIn())
        }
    } catch (e) {
        // Deal with the fact the chain failed
    }
  }

  useEffect(() => {
    document.title = 'Let\'s just draw!';
  }, []);

  checkInitialCookies();

  return <Routes>
    <Route path="/" element={<PrivateRoute/>}>
      <Route path="/" element={<Home></Home>}></Route>
    </Route>
    <Route path="/login" element={<Login></Login>}></Route>
    <Route path="/signup" element={<Signup/>}/>
    <Route path="/reset-password" element={<ResetPassword/>}/>
    <Route path="/reset-password-form/:id" element={<ResetPasswordForm/>}/>
  </Routes>
}

export default App;
