import React from 'react';
// import { Link } from 'react-router-dom';
import logo from '../helpers/logo.jpg';
import '../../styles/NavBar.css'

function NavBar(props) {
    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className='logo'/>
            <div className="navbar-left">
                <a href="/">Home</a>
                <a href="/OrderNow">Order Now</a>
                <a href="/Restaurants">Restaurants</a>
                <a href="/SuperMarket">Super Market</a>
                <a href="/CustomerLogin">Customer Login</a>
                <a href="/Login">Seller Login</a>
            </div>
            <div className="navbar-right">
                <a href="/CustomerSignUp">Customer Signup</a>
                <a href="/SignUp">Seller Signup</a>
            </div>
        </div>
    );
}

export default NavBar;