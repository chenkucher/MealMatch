import React, { useEffect, useState } from 'react';

import styles from '../styles/ContactUs.module.css';
import NavBar from './components/CustomerManager/CustomerNavBar';

function ContactUs() {
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleSubjectChange = (event) => {
    setSubject(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Send the form data to the backend
    // Replace the API endpoint and add the necessary code to handle the request
    fetch('/api/ContactUs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, subject }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Response:', data);
        // Handle the response from the server if needed
      })
      .catch((error) => {
        console.error('Error:', error);
        // Handle errors if any
      });

    // Clear the form fields after submission
    setText('');
    setSubject('');
  };

  return (
    <div className={styles.container}>
      <header>
        {/* <NavBar loggedIn={loggedIn} /> */}
      </header>

      <main className={styles.main}>
        <section className={styles.section_side}>
          {/* <Sidebar loggedIn={loggedIn} /> */}
        </section>

        <section className={styles.section_middle}>
          <div className={styles.container}>
            <h1>Contact Us</h1>
            <p>
              For any inquiries or feedback, please contact us at support@yourwebsite.com. We are here to assist you 24/7.
            </p>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="subject">Subject:</label>
                <input type="text" id="subject" value={subject} onChange={handleSubjectChange} />
              </div>
              <div>
                <label htmlFor="text">Text:</label>
                <textarea id="text" value={text} onChange={handleTextChange} />
              </div>
              <button type="submit">Submit</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ContactUs;
