import React from 'react';

import '../../styles/Orders.css'
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import OrderTable from '../components/RestaurantManager/OrderTable';

function Orders(props) {
    return (
        <div>
            <header>
                <NavBar/>
            </header>

            <main>
                <div>
                    <Sidebar/>
                </div>
                <div>
                    <h1>Orders Managment</h1>
                    <div>
                        <OrderTable/>
                    </div>

                </div>

            </main>
           
            </div>
    );
}

export default Orders;