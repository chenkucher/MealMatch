import React, { useState } from 'react';
import styles from '../styles/Home.module.css';
import NavBar from './components/RestaurantManager/NavBar';
import { useNavigate } from 'react-router-dom';


//home page
function Home() {
  const navigate = useNavigate();
  const [boxHoverStates, setBoxHoverStates] = useState({
    customers: false,
    sellers: false
  });

  const handleBoxHover = (boxType) => {
    setBoxHoverStates({ ...boxHoverStates, [boxType]: true });
  }

  const handleBoxLeave = (boxType) => {
    setBoxHoverStates({ ...boxHoverStates, [boxType]: false });
  }

  const getBoxStyle = (boxType) => {
    if (boxHoverStates[boxType]) {
      return {
        backgroundColor: '#ddd',
        backgroundSize: 'cover' 
      };
    } else {
      return {
        backgroundImage: 'none',
        backgroundColor: '#F6F7F1'
      };
    }
  }

  const backgroundImage = 'https://mealmatch.s3.amazonaws.com/background.jpg';
  const logo = 'https://mealmatch.s3.amazonaws.com/logo.jpg';

  return (
    <div className={styles.homePage}>
      <header>
        <NavBar/>
      </header>
      <img src={logo} alt="logo" className={styles.logoImage} />
      <div className={styles.middleOptions}>
        <div
          className={styles.customersBox}
          style={getBoxStyle('customers')}
          onMouseEnter={() => handleBoxHover('customers')}
          onMouseLeave={() => handleBoxLeave('customers')}
          onClick={() => navigate('/CustomerLogin')}
        >
          <h1>Customers</h1>
        </div>
        <div
          className={styles.sellersBox}
          style={getBoxStyle('sellers')}
          onMouseEnter={() => handleBoxHover('sellers')}
          onMouseLeave={() => handleBoxLeave('sellers')}
          onClick={() => navigate('/Login')}
        >
          <h1>Sellers</h1>
        </div>
      </div>
      <img src={backgroundImage} alt="Background" className={styles.backgroundImage} />
    </div>
  );
}

export default Home;
