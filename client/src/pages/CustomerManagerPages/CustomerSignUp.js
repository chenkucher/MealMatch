import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/SignupPage.css";
import Swal from "sweetalert2";
import NavBar from "../components/RestaurantManager/NavBar";



//sign up page
function CustomerSignUp() {
  const [first_name, setFname] = useState("");
  const [last_name, setLname] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(60);

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
      const response = await axios.post('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerResendConfirmation', { email});
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
      const response = await axios.post(
        "http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerSignup",
        {
          first_name,
          last_name,
          address,
          phone,
          email,
          password,
          confirm_password: confirmPassword,
        }
      );
      console.log(response.data.message);
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
            <h1>Customer Signup</h1>
            <form onSubmit={handleSubmit}>
              <label>First Name:</label>
              <input
                type="text"
                name="fname"
                value={first_name}
                onChange={(e) => setFname(e.target.value)}
              />
              <label>Last Name:</label>
              <input
                type="text"
                name="lname"
                value={last_name}
                onChange={(e) => setLname(e.target.value)}
              />
              <label>Address:</label>
              <input
                type="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label>Phone Number:</label>
              <input
                type="text"
                name="phone"
                value={phone}
                onChange={(e) => setPhoneNumber(e.target.value)}
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

export default CustomerSignUp;
