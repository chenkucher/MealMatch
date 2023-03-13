import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import '../../styles/Settings.css'



function Settings(props) {
    const [restaurantName, setRestaurantName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [openingHours, setOpeningHours] = useState('');
    const [deliveryFee, setDeliveryFee] = useState('');
  
    useEffect(() => {
      // Fetch initial data from the server
      fetch('/api/settings')
        .then((response) => response.json())
        .then((data) => {
          setRestaurantName(data.restaurantName);
          setAddress(data.address);
          setPhone(data.phone);
          setLogoUrl(data.logoUrl);
          setOpeningHours(data.openingHours);
          setDeliveryFee(data.deliveryFee);
        })
        .catch((error) => console.error(error));
    }, []);
  
    function handleSave() {
      // Send updated data to the server
      const data = {
        restaurantName,
        address,
        phone,
        logoUrl,
        openingHours,
        deliveryFee,
      };
  
      fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
    }
  
    return (
        <div>
            <header>
                <NavBar/>
            </header>
        <main>
            <div>
                <Sidebar/>
            </div>
            <div className="settings-page">
                <h2>Settings</h2>
                <form>
                <div>
                    <label htmlFor="restaurant-name">Restaurant Name:</label>
                    <input
                    type="text"
                    id="restaurant-name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="address">Address:</label>
                    <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="phone">Phone:</label>
                    <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="logo-url">Logo URL:</label>
                    <input
                    type="text"
                    id="logo-url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="opening-hours">Opening Hours:</label>
                    <input
                    type="text"
                    id="opening-hours"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="delivery-fee">Delivery Fee:</label>
                    <input
                    type="text"
                    id="delivery-fee"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    />
                </div>
                </form>
                <button onClick={handleSave}>Save</button>
            </div>
        </main>
    
        </div>
       
    );
}

export default Settings;