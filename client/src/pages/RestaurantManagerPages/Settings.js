import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/RestaurantManager/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import styles from '../../styles/Settings.module.css';
import axios from 'axios';

//showing and managing account details
function Settings() {
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantDetails, setRestaurantDetails] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [paypalApiKey, setPaypalApiKey] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [openingHoursStart, setOpeningHoursStart] = useState('');
  const [openingHoursEnd, setOpeningHoursEnd] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [logoUpdated, setLogoUpdated] = useState(false);

  const { restaurantId } = useParams();
  const logo = "https://mealmatch.s3.amazonaws.com/logo.jpg";
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
        setEmail(data.restaurant_email);
        setRestaurantDetails(data.restaurant_details);
        setOpeningHoursStart(data.start_opening_time);
        setOpeningHoursEnd(data.close_opening_time);
        setPaypalApiKey(data.paypal_api_key);

      })
      .catch((error) => console.error(error));
  }, []);


  function handleLogoChange(event) {
    const file = event.target.files[0];
  
    if (file) {
      const imageURL = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageURL;
      setLogoUpdated(true)
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
  
        // Convert the image to PNG format
        canvas.toBlob((blob) => {
          setLogoFile(blob);
  
          // Release the object URL to free up memory
          URL.revokeObjectURL(imageURL);
        }, "image/png");
      };
    }
  }
  

  async function handleSave() {
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

      if (logoFile) {
        // Generate a unique file name (e.g., using the current timestamp)
        const fileName = `restaurant_logo_${restaurantId}.png`;
    
        // Upload the logo to S3 and update the logoUrl state variable
        // Prepare the file for upload
        let formData = new FormData();
        formData.append('imageFile', logoFile);
        formData.append('itemId', restaurantId);
        formData.append('type', 'restaurant_logo');
        // Upload new image to S3 via a POST request
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
    
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
    
        const data = await response.json();
        const imageUrl = data.imageUrl;  
        setLogoUrl(imageUrl + '?timestamp=' + new Date().getTime());

      }
    // Send updated data to the server
    const data = {
      restaurantName,
      address,
      phone,
      logoUrl,
      openingHoursStart,
      openingHoursEnd,
      email,
      password,
      confirmPassword,
      restaurantDetails,
      paypalApiKey,
      logoUpdated
    };
    
    console.log(data);
  
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

  
  
  return (
    <div className={styles.container}>
      <header>
        <NavBar loggedIn={loggedIn} restaurantId={restaurantId}/>
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
                <div className={styles.logo}>
                  <label htmlFor="logo-file">Logo:</label>
                  <input
                    type="file"
                    id="logo-file"
                    accept="image/jpeg, image/png, image/jpg"
                    onChange={handleLogoChange}
                  />
                  <img
                  src={logoUrl || logo}
                  alt={`${restaurantName} logo`}
                  className={styles.logoImage}

                  />
                </div>

                <div>
                  <label htmlFor="opening-hours-start">Opening Hours Start:</label><br/>
                  <input
                    type="time"
                    id="opening-hours-start"
                    value={openingHoursStart}
                    onChange={(e) => setOpeningHoursStart(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="opening-hours-end">Opening Hours End:</label><br/>
                  <input
                    type="time"
                    id="opening-hours-end"
                    value={openingHoursEnd}
                    onChange={(e) => setOpeningHoursEnd(e.target.value)}
                  />
                </div>


          
              </form>
              {errorMessage && (
                <div className={styles.error}>{errorMessage}</div>
              )}
              <button className={styles.save_button} onClick={handleSave}>Save Changes</button>
            </div>
            <div className={styles.settings_page_right}>
              <h2>Account Settings</h2>
              <div>
                <label htmlFor="paypal-api-key">PayPal API Key:</label>
                <input
                  type="password"
                  id="paypal-api-key"
                  value={paypalApiKey}
                  onChange={(e) => setPaypalApiKey(e.target.value)}
                />
              </div>
              <div>
                  <label htmlFor="email">Email:</label><br/>
                  <input
                    type="text"
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
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default Settings;
