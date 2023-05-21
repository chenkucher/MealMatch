import React from 'react';
import Routers from './Routers';
import ShoppingCartProvider from '../pages/components/CustomerManager/ShoppingCartProvider';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function App() {
  return (
    <div className="App">
      {/* <PayPalScriptProvider options={{ "client-id": "your-client-id" }}> */}
        <ShoppingCartProvider>
          <Routers />
        </ShoppingCartProvider>
      {/* </PayPalScriptProvider> */}
    </div>
  );
}

export default App;
