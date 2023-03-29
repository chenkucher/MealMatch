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
import ConfirmEmailPage from '../pages/ConfirmEmailPage';
import InvalidTokenPage from '../pages/components/InvalidTokenPage';
import Home from './Home';

function Routers(props) {
    return (
        <Router>
             <Routes >
                 <Route path="/" element={<Home/>} />
                 <Route path="/RestaurantManage/:restaurantId" element={<RestaurantManage />} />
                 <Route path="/confirmEmail/:tokenId" element={<ConfirmEmailPage/>} />
                 <Route path="/MenuManager/:restaurantId" element={<MenuManager/>} />
                 <Route path="/Statistic/:restaurantId" element={<Statistic/>} />
                 <Route path="/Storage/:restaurantId" element={<Storage/>} />
                 <Route path="/Orders/:restaurantId" element={<Orders/>} />
                 <Route path="/Settings/:restaurantId" element={<Settings/>} />
                 <Route path="/Login" element={<Login/>} />
                 <Route path="/CustomerLogin" element={<CustomerLogin/>} />
                 <Route path="/SignUp" element={<SignUp/>} />
                 <Route path="/CustomerSignUp" element={<CustomerSignUp/>} />
                 <Route path="/InvalidTokenPage" element={<InvalidTokenPage/>} />

             </Routes>
        </Router>
    );
}

export default Routers;