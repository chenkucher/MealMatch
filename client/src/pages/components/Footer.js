import React from 'react';
import styles from '../../styles/Footer.module.css';

function Footer() {
    return (
        <footer className={styles.footer}>
            <ul className={styles.footer_links}>
                <li><a href="/contact-us">Contact Us</a></li>
                <li><a href="/terms-of-use">Terms of Use</a></li>
                <li><a href="/privacy-policy">Privacy Policy</a></li>
            </ul>
        </footer>
    );
}

export default Footer;
