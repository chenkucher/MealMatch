import React from 'react';
import styles from '../../styles/InvalidTokenPage.module.css';


function InvalidTokenPage(props) {

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Invalid Token</h1>
        <p className={styles.text}>The token provided is invalid or has expired.</p>
        <p className={styles.text}>Please contact support if you believe this is an error.</p>
      </div>
    </div>
  );
}

export default InvalidTokenPage;
