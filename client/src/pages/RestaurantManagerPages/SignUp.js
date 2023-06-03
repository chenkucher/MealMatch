import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/SignupPage.css";
import NavBar from "../components/NavBar";
import Swal from "sweetalert2";


function SellerSignupPage() {
  const [name, setName] = useState("");
  const [restaurantDetails, setRestaurantDetails] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [openingHoursStart, setOpeningHoursStart] = useState("");
  const [openingHoursEnd, setOpeningHoursEnd] = useState("");
  const [paypalApiKey, setPaypalApiKey] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (isSubmitted) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const handleResend = async () => {
    try {
      const response = await axios.post('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/RestaurantResendConfirmation', { email});
      if (response.data.message === "Confirmation email sent.") {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Email sent!',
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'An error occurred while sending email',
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'An error occurred while sending email',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const requestData = {
        name,
        restaurantDetails,
        address,
        phone: phoneNumber,
        email,
        password,
        confirm_password: confirmPassword,
        openingHoursStart,
        openingHoursEnd,
        paypal_api_key: paypalApiKey,
      };

      const response = await axios.post(
        "http://ec2-35-169-139-56.compute-1.amazonaws.com/api/SellerSignup",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);

      if (
        response.data.message ===
        "Signup successful. Please check your email for a confirmation link."
      ) {
        setIsSubmitted(true);
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <div
      className={`signup-page${isSubmitted && seconds < 60 ? " disabled" : ""}`}
    >
      {isSubmitted ? (
        <div className="signup-success">
          <h2>Signup successful!</h2>
          <p>Please check your email for a confirmation link.</p>
          {seconds <= 0 ? (
            <p>
              Didn't receive an email?{" "}
              <button onClick={handleResend} className="resend-link">
                Resend
              </button>
            </p>
          ) : (
            <p className="timer">You can try again in {seconds} seconds.</p>
          )}
        </div>
      ) : (
        <>
          <header>
            <NavBar />
          </header>
          <div className="signup-form">
            <h1>Seller Signup</h1>
            <form onSubmit={handleSubmit}>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label>Address:</label>
              <input
                type="text"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <label>Opening Hours Start:</label>
              <input
                type="time"
                name="openingHoursStart"
                value={openingHoursStart}
                onChange={(e) => setOpeningHoursStart(e.target.value)}
              />
              <label>Opening Hours End:</label>
              <input
                type="time"
                name="openingHoursEnd"
                value={openingHoursEnd}
                onChange={(e) => setOpeningHoursEnd(e.target.value)}
              />
              <label>Restaurant Description:</label>
              <textarea
                name="restaurantDetails"
                value={restaurantDetails}
                onChange={(e) => setRestaurantDetails(e.target.value)}
                maxLength="300"
                rows="4"
              ></textarea>
              <label>Phone Number:</label>
              <input
                type="tel"
                name="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <label>Paypal API Account ID:</label>
              <input
                type="password"
                name="paypal_api_key"
                value={paypalApiKey}
                onChange={(e) => setPaypalApiKey(e.target.value)}
              />
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Confirm Password:</label>
              <input
                type="password"
                name="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button type="submit">Signup</button>
            </form>
            {error && <p className="error">{error}</p>}
          </div>
        </>
      )}
    </div>
  );
}

export default SellerSignupPage;
