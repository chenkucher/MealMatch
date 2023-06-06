import React from 'react';
import Routers from './Routers';
import ShoppingCartProvider from '../pages/components/CustomerManager/ShoppingCartProvider';

function App() {
  return (
    <div className="App">
        <ShoppingCartProvider>
          <Routers />
        </ShoppingCartProvider>
    </div>
  );
}

export default App;
