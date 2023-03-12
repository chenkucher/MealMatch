import React from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import { Routes,Route} from "react-router-dom";
import MenuManager from './RestaurantManagerPages/MenuManager';
import RestaurantManage from '../pages/RestaurantManage';
import Statistic from './RestaurantManagerPages/Statistic';
import Storage from './RestaurantManagerPages/Storage';
import Orders from './RestaurantManagerPages/Orders';
import Settings from './RestaurantManagerPages/Settings';
import Login from './RestaurantManagerPages/Login';
import CustomerLogin from './CustomerLogin';
import SignUp from './RestaurantManagerPages/SignUp';
import CustomerSignUp from './CustomerSignUp';


function Routers(props) {
    return (
        <Router>
             <Routes >
                 <Route path="/" element={<RestaurantManage/>} />
                 <Route path="/RestaurantManage" element={<RestaurantManage/>} />
                 <Route path="/MenuManager" element={<MenuManager/>} />
                 <Route path="/Statistic" element={<Statistic/>} />
                 <Route path="/Storage" element={<Storage/>} />
                 <Route path="/Orders" element={<Orders/>} />
                 <Route path="/Settings" element={<Settings/>} />
                 <Route path="/Login" element={<Login/>} />
                 <Route path="/CustomerLogin" element={<CustomerLogin/>} />
                 <Route path="/SignUp" element={<SignUp/>} />
                 <Route path="/CustomerSignUp" element={<CustomerSignUp/>} />


                 
             </Routes>
        </Router>
    );
}

export default Routers;