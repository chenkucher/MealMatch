import React from 'react';
import Sidebar from '../pages/components/RestaurantManager/Sidebar';
import '../styles/RestaurantManage.css'
import NavBar from './components/NavBar';
import BestSellingItemsTable from './components/RestaurantManager/BestSellingItemsTable';
import LastOrdersTable from './components/RestaurantManager/LastOrdersTable';
import FutureOrdersChart from './components/RestaurantManager/FutureOrdersChart';

function RestaurantManage(props) {

    return (
        <div className='container'>

            <header>
                <NavBar/>
            </header>

            
            <main>
                <div>
                    <Sidebar />
                </div>

                <div className='dashboard'>
                    <div className='dash-box'>
                        <h1>Future Orders</h1>
                        <div className='dashboard-sum'>
                            <FutureOrdersChart/>
                        </div>
                    </div>

                    <div className='dash-box'>
                        <h1>Best Orders</h1>
                        <div className='best-sum'>
                            <BestSellingItemsTable/>
                        </div>
                    </div>
                </div>
            </main>

            <div className='last-events'>
                <h1>Last Events</h1>
                <div className='events-list'>
                    <LastOrdersTable/>
                </div>
            </div>
        </div>


       


    );
}

export default RestaurantManage;
