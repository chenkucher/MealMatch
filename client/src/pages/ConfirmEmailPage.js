import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/ConfirmEmailPage.module.css'

function ConfirmEmailPage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      try {
        const response = await axios.get('http://vmedu265.mtacloud.co.il/api/check-email-confirmation', { withCredentials: true });
        const emailConfirmed = response.data.emailConfirmed;
        if (emailConfirmed) {
          setMessage('Thank you for confirming your email. You can now log in to your account.');
        } else {
          setMessage('Invalid confirmation link.');
        }
      } catch (error) {
        setMessage('An error occurred while confirming your email.');
      }
    };

    checkEmailConfirmation();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Email Confirmation</h1>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
export default ConfirmEmailPage;
