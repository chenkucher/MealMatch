import React, { useState, useEffect } from 'react';
import styles from '../../styles/CustomerPreferences.module.css';
import { useNavigate, useParams } from 'react-router-dom';
const categories = ['Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'Thai', 'Mediterranean', 'American'];

const CustomerPreferences = () => {
    const { customerId } = useParams();
    const [selectedCategories, setSelectedCategories] = useState([]);
    const navigate = useNavigate();

    const toggleCategory = (category) => {
      setSelectedCategories((prevSelected) => {
        if (prevSelected.includes(category)) {
          return prevSelected.filter((cat) => cat !== category);
        } else {
          return [...prevSelected, category];
        }
      });
    };
  
    const submitPreferences = async () => {
      try {
        const response = await fetch('/api/CustomerPreferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId,
            preferences: selectedCategories,
          }),
        });
  
        if (response.ok) {
                console.log('Preferences saved successfully');
                navigate(`/CustomerManage/${customerId}`);
            } else {
                console.error('Error saving preferences:', response.statusText);
            }
            } catch (error) {
            console.error('Error saving preferences:', error);
            }
        };
  
    return (
      <div className={styles.preferencesContainer}>
        {categories.map((category, index) => (
          <div
            key={index}
            className={`${styles.categoryCircle} ${selectedCategories.includes(category) ? styles.selected : ''}`}
            style={{
              left: `${Math.random() * 80}%`,
              top: `${Math.random() * 80}%`,
            }}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </div>
        ))}
        <button className={styles.submitBtn} onClick={submitPreferences}>
          Submit Preferences
        </button>
      </div>
    );
  };
  
  export default CustomerPreferences;