import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../helpers/logo.jpg';
import '../../styles/NavBar.css'

function NavBar(props) {
    return (
        <div className='nav'>

            <nav className="horizontal-nav">
            <img src={logo} alt="Logo" className='logo'/>
            
            <div className='nav-list'>
                <ul >
                        <li>
                        <Link to="/">Order Now</Link>
                        </li>
                        <li>
                        <Link to="/about">About</Link>
                        </li>
                        <li>
                        <Link to="/contact">Contact</Link>
                        </li>
                    </ul>
            </div>
                
            </nav>
        </div>
    );
}

export default NavBar;