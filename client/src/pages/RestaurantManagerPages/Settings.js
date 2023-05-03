import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import styles from '../../styles/Settings.module.css';
import axios from 'axios';

function Settings(props) {
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantDetails, setRestaurantDetails] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/SellerLogin')
      .then((response) => {
        console.log(response);
        setLoggedIn(response.data.loggedIn);
        if (response.data.loggedIn === false) {
          // Redirect to login page if not logged in
          navigate('/Login');
        } else if (
          response.data.loggedIn === true &&
          response.data.userId != restaurantId
        ) {
          // Redirect to login page if not logged in
          navigate('/Login');
        }
      });
  }, []);

  useEffect(() => {
    // Fetch initial data from the server
    fetch('/api/RestaurantSettings')
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setRestaurantName(data.restaurant_name);
        setAddress(data.restaurant_address);
        setPhone(data.restaurant_phone_number);
        setLogoUrl(data.restaurant_logo_url);
        setOpeningHours(data.opening_hours);
        setDeliveryFee(data.delivery_fee);
        setEmail(data.restaurant_email);
        setRestaurantDetails(data.restaurant_details); // Add this line
      })
      .catch((error) => console.error(error));
  }, []);


  function handleSave() {
    if (password !== confirmPassword) {
        const alertBox = document.createElement('div');
          alertBox.className = styles.pass;
          alertBox.textContent = 'Password and confirm password must match.';
          document.body.appendChild(alertBox);
  
          setTimeout(() => {
            document.body.removeChild(alertBox);
          }, 3000);
        return;
      }
    // Send updated data to the server
    const data = {
      restaurantName,
      address,
      phone,
      logoUrl,
      openingHours,
      deliveryFee,
      email,
      password,
      confirmPassword,
      restaurantDetails,
    };
  
    fetch('/api/SellerSettings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Email already exists.' || data.message === 'Phone number already exists.') {
          const alertBox = document.createElement('div');
          alertBox.className = styles.alert;
          alertBox.textContent = data.message;
          document.body.appendChild(alertBox);
  
          setTimeout(() => {
            document.body.removeChild(alertBox);
          }, 5000);
        }else if(data.message === 'No fields updated.') {
          const alertBox = document.createElement('div');
          alertBox.className = styles.no_fields;
          alertBox.textContent = data.message;
          document.body.appendChild(alertBox);
  
          setTimeout(() => {
            document.body.removeChild(alertBox);
          }, 5000);
        }
        else {
          const alertBox = document.createElement('div');
          alertBox.className = styles.success;
          alertBox.textContent = 'Settings updated successfully.';
          document.body.appendChild(alertBox);
  
          setTimeout(() => {
            document.body.removeChild(alertBox);
          }, 5000);
        }
      })
      .catch((error) => console.error(error));
  }
//   function handlePasswordChange() {
//     setShowPasswordInputs(!showPasswordInputs);
//   }
  
  
  return (
    <div>
      <header>
        <NavBar loggedIn={loggedIn} />
      </header>
      <main className={styles.main}>
        <section className={styles.section_side}>
          <div className={styles.sidebar}>
            <Sidebar loggedIn={loggedIn} />
          </div>
        </section>
        <section className={styles.section_middle}>
          <div className={styles.settings_page}>
            <div className={styles.settings_page_left}>
              <h2>Restaurant Settings</h2>
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
                  <label htmlFor="restaurant-details">Restaurant Details:</label>
                  <textarea
                    id="restaurant-details"
                    value={restaurantDetails}
                    onChange={(e) => setRestaurantDetails(e.target.value)}
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
              {errorMessage && (
                <div className={styles.error}>{errorMessage}</div>
              )}
              <button onClick={handleSave}>Save</button>
            </div>
            <div className={styles.settings_page_right}>
              <h2>Account Settings</h2>
              <div>
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              <div className={styles.password_container}>
                {!showPasswordFields ? (
                    
                  <button onClick={() => setShowPasswordFields(true)}>
                    Change Password
                  </button>
                ) : (
                  <form>
                    <div>
                      <label htmlFor="password">Password:</label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirm-password">Confirm Password:</label>
                      <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </form>
                )}
                {/* <button onClick={handleSave}>Save</button> */}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default Settings;
