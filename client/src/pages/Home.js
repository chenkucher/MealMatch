import React, { useState } from 'react';
import '../styles/Home.css'
import NavBar from './components/NavBar';
import logo from './helpers/logo.jpg';
import makeFoodImage from './helpers/makefood.jpg';
import planFoodImage from './helpers/planfood.jpg';

// remove this line
// import backgroundImage from './helpers/background.jpg';

function Home(props) {
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
        backgroundImage: `url(${boxType === 'customers' ? planFoodImage : makeFoodImage})`,
        backgroundColor: '#ddd',
        backgroundSize: 'cover' // add this property to fit the image to the box
      };
    } else {
      return {
        backgroundImage: 'none',
        backgroundColor: '#F6F7F1'
      };
    }
  }

  // Use the URL directly in the style
  const backgroundImage = 'https://mealmatch.s3.amazonaws.com/background.jpg';

  return (
    <div className="home-page">
      <header>
        <NavBar/>
      </header>
      <img src={logo} alt="logo" className="logo-image" />
      <div className='middleOptions'>
        <div
          className='customers box'
          style={getBoxStyle('customers')}
          onMouseEnter={() => handleBoxHover('customers')}
          onMouseLeave={() => handleBoxLeave('customers')}
        >
          <h1>Customers</h1>
        </div>
        <div
          className='sellers box'
          style={getBoxStyle('sellers')}
          onMouseEnter={() => handleBoxHover('sellers')}
          onMouseLeave={() => handleBoxLeave('sellers')}
        >
          <h1>Sellers</h1>
        </div>
      </div>
      <img src={backgroundImage} alt="Background" className="background-image" />
    </div>
  );
}

export default Home;
