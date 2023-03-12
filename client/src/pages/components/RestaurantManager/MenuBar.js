import React from 'react';
import { Link } from 'react-router-dom';
import '../../../styles/NavBar.css';

function MenuBar(props) {
    return (
      <div className='nav'>
        <nav className="horizontal-nav">
          {/* <img src={logo} alt="Logo" className='logo'/> */}
          
          <div className='nav-list'>
              <ul >
                      <li>
                      <Link to="/">Categories</Link>
                      </li>
                      <li>
                      <Link to="/about">Add New Item</Link>
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

export default MenuBar;