import React from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import { Routes,Route} from "react-router-dom";
import MenuManager from './RestaurantManagerPages/MenuManager';
import RestaurantManage from '../pages/RestaurantManagerPages/RestaurantManage';
import Orders from './RestaurantManagerPages/Orders';
import Settings from './RestaurantManagerPages/Settings';
import Login from './RestaurantManagerPages/Login';
import SignUp from './RestaurantManagerPages/SignUp';
import ResetPasswordPage from './RestaurantManagerPages/ResetPasswordPage'; 

import ConfirmEmailPage from '../pages/ConfirmEmailPage';
import InvalidTokenPage from '../pages/components/InvalidTokenPage';
import CustomerPreferences from '../pages/CustomerManagerPages/CustomerPreferences'
import CustomerSignUp from '../pages/CustomerManagerPages/CustomerSignUp';
import CustomerLogin from '../pages/CustomerManagerPages/CustomerLogin';
import CustomerManage from '../pages/CustomerManagerPages/CustomerManage'
import CustomerSettings from '../pages/CustomerManagerPages/CustomerSettings'
import CustomerExplore from '../pages/CustomerManagerPages/CustomerExplore'
import CustomerOrders from '../pages/CustomerManagerPages/CustomerOrders'
import CustomerMenuView from '../pages/CustomerManagerPages/CustomerMenuView'
import CustomerCategoryPage from '../pages/CustomerManagerPages/CustomerCategoryPage'
import CustomerMealMatcher from '../pages/CustomerManagerPages/CustomerMealMatcher'
import CustomerCheckOut from '../pages/CustomerManagerPages/CustomerCheckOut'
import CustomerResetPasswordPage from './CustomerManagerPages/CustomerResetPasswordPage.js'
import CustomerEmailCheckout from '../pages/CustomerManagerPages/CustomerEmailCheckout'

import Home from './Home';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfUse from './TermsOfUse';
import ContactUs from './ContactUs';

function Routers(props) {
    return (
        <Router>
             <Routes >
                {/* -- general pages --  */}
                 <Route path="/" element={<Home/>} />
                 <Route path="/PrivacyPolicy" element={<PrivacyPolicy/>} />
                 <Route path="/TermsOfUse" element={<TermsOfUse/>} />
                 <Route path="/ContactUs" element={<ContactUs/>} />
                

                {/* -- restaurant managment pages --  */}
                 <Route path="/RestaurantManage/:restaurantId" element={<RestaurantManage />} />
                 <Route path="/confirmEmail/:tokenId" element={<ConfirmEmailPage/>} />
                 <Route path="/MenuManager/:restaurantId" element={<MenuManager/>} />
                 <Route path="/Orders/:restaurantId" element={<Orders/>} />
                 <Route path="/Settings/:restaurantId" element={<Settings/>} />
                 <Route path="/Login" element={<Login/>} />
                 <Route path="/SignUp" element={<SignUp/>} />
                 <Route path="/InvalidTokenPage" element={<InvalidTokenPage/>} />
                 <Route path="/RestaurantResetPasswordPage/:token" element={<ResetPasswordPage/>} />

                {/* -- customers pages --  */}
                 <Route path="/CustomerSignUp" element={<CustomerSignUp/>} />
                 <Route path="/CustomerLogin" element={<CustomerLogin/>} />
                 <Route path="/CustomerPreferences/:customerId" element={<CustomerPreferences/>} />
                 <Route path="/CustomerManage/:customerId" element={<CustomerManage/>} />
                 <Route path="/CustomerSettings/:customerId" element={<CustomerSettings/>} />
                 <Route path="/CustomerExplore/:customerId" element={<CustomerExplore/>} />
                 <Route path="/CustomerOrders/:customerId" element={<CustomerOrders/>} />
                 <Route path="/CustomerMenuView/:customerId/:restaurantId" element={<CustomerMenuView/>} />
                 <Route path="/CustomerCategoryPage/:category" element={<CustomerCategoryPage/>} />
                 <Route path="/CustomerMealMatcher/:customerId" element={<CustomerMealMatcher/>} />
                 <Route path="/CustomerCheckOut/:customerId" element={<CustomerCheckOut/>} />
                 <Route path="/CustomerResetPasswordPage/:token" element={<CustomerResetPasswordPage/>} />
                 <Route path="/CustomerEmailCheckout/:orderId" element={<CustomerEmailCheckout/>} />
                 
             </Routes>
        </Router>
    );
}

export default Routers;