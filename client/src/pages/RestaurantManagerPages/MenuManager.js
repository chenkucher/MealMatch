import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import '../../styles/MenuManager.css'
function MenuManager(props) {
    const [menuItems, setMenuItems] = useState([]);

    useEffect(() => {
      // Fetch menu items data from the server
      fetch('http://127.0.0.1:5000/api/menu')
        .then((response) => response.json())
        .then((data) => {
          setMenuItems(data);
        })
        .catch((error) => console.error(error));
    }, []);
  
    // Get a list of unique categories
    const categories = [...new Set(menuItems.map((item) => item.category))];
    return (
        <div>
             <header>
                <NavBar/>
            </header>


            <main>
                <div>
                    <Sidebar/>
                </div>


                <div>
                    <div className="menu-page">
                    <h1>Menu Managment</h1>
                    {categories.map((category) => (
                    <div key={category}>
                            <h3>{category}</h3>
                            <div className="menu-items-container">
                                {menuItems
                                .filter((item) => item.category === category)
                                .map((item) => (
                                    <div className="menu-item-box" key={item.id}>
                                    <div className="menu-item-image">
                                        <img src={'https://via.placeholder.com/300x225?text=No+Image+Available'} alt={item.name} />
                                    </div>
                                    <div className="menu-item-details">
                                        <p className="menu-item-name">{item.name}</p>
                                        <p className="menu-item-ingredients">{item.ingredients}</p>
                                        <p className="menu-item-price">Price: ${item.price.toFixed(2)}</p>
                                    </div>
                                    </div>
                                ))}
                            </div>
                    </div>
                    ))}
                </div>

                </div>




            </main>
            
        </div>
    );
}

export default MenuManager;