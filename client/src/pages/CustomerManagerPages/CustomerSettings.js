import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../pages/components/CustomerManager/CustomerSidebar';
import NavBar from '../components/CustomerManager/CustomerNavBar';
import styles from '../../styles/Settings.module.css';
import axios from 'axios';

function CustomerSettings() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customerPreferences, setCustomerPreferences] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [showPreferencesPopup, setShowPreferencesPopup] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = [
    'Italian', 'Burger', 'Street-Food', 'Kosher', 'Sandwich', 'Asian', 'Vegan', 'Dessert', 'Sushi', 'Mexican'
  ];
  function handleSavePreferences() {
    setCustomerPreferences(selectedCategories.join(', '));
    setShowPreferencesPopup(false);
  }
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(item => item !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  useEffect(() => {
    setCustomerPreferences(selectedCategories.join(','));
  }, [selectedCategories]);

  const handleShowPreferencesPopup = () => {
    if (customerPreferences) {
      setSelectedCategories(customerPreferences.split(',').map((category) => category.trim()));
    } else {
      setSelectedCategories([]);
    }
    setShowPreferencesPopup(true);
  };
  
  

  useEffect(() => {
    axios.get("http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerLogin").then((response) => {
      console.log(response);
      setLoggedIn(response.data.loggedIn);
      if (response.data.loggedIn===false) {
        // Redirect to login page if not logged in
        navigate('/CustomerLogin');
      }
      else if (response.data.loggedIn===true && response.data.userId!=customerId) {
        // Redirect to login page if not logged in
        console.log(response.data.userId,customerId);
        navigate('/CustomerLogin');
      }
    });

  }, []);
  useEffect(() => {
    fetch('/api/CustomerSettings')
      .then((response) => response.json())
      .then((data) => {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setAddress(data.address);
        setEmail(data.email);
        setPhoneNumber(data.phone_number);
        setCustomerPreferences(data.customer_preferences);
      })
      .catch((error) => console.error(error));
  }, []);

  function handleSave() {
    if (password !== confirmPassword) {
      alert('Password and confirm password must match.');
      return;
    }

    const data = {
      firstName,
      lastName,
      address,
      email,
      phoneNumber,
      password,
      confirmPassword,
      customerPreferences,
    };

    fetch('/api/CustomerSettings', {
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
                    <h2>Customer Settings</h2>
                    <form>
                        <div>
                            <label htmlFor="first-name">First Name:</label>
                            <input
                            type="text"
                            id="first-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="last-name">Last Name:</label>
                            <input
                            type="text"
                            id="last-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
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
                            <label htmlFor="email">Email:</label>
                            <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber">Phone:</label>
                            <input
                            type="text"
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="preferences">Preferences:</label>
                            <input
                            type="text"
                            id="preferences"
                            value={customerPreferences}
                            readOnly
                            />
                            <button type="button" onClick={handleShowPreferencesPopup}>Change Preferences</button>

                        </div>
                    </form>
                    {errorMessage && (
                    <div className={styles.error}>{errorMessage}</div>
                    )}
                    <button onClick={handleSave}>Save</button>
                </div>
                <div className={styles.settings_page_right}>
                    <h2>Account Settings</h2>
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
      {showPreferencesPopup && (
      <>
        <div
          className={styles.blur_background}
          onClick={() => setShowPreferencesPopup(false)}
        ></div>
        <div className={styles.preferences_popup}>
          <h3>Select Preferences</h3>
          <div className={styles.categories}>
            {categories.map((category) => (
              <div
                key={category}
                className={`${styles.circle} ${
                  selectedCategories.includes(category)
                    ? styles.selected
                    : ""
                }`}
                onClick={() => toggleCategory(category)}
              >
                {category}
              </div>
            ))}
          </div>
          <button onClick={handleSavePreferences}>Save Preferences</button>
        </div>
      </>
    )}
    </div>
  );
}
export default CustomerSettings;





// remove the spaces from the preferences!!!