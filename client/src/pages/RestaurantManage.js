import React from 'react';
import Sidebar from '../pages/components/RestaurantManager/Sidebar';
import '../styles/RestaurantManage.css'
import NavBar from './components/NavBar';

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
                        <h1>Dashboard</h1>
                        <div className='dashboard-sum'>

                        </div>
                    </div>

                    <div className='dash-box'>
                        <h1>Best Selling</h1>
                        <div className='best-sum'>

                        </div>
                    </div>
                </div>
            </main>

            <div className='last-events'>
                <h1>Last Events</h1>
                <div className='events-list'>

                </div>
            </div>
        </div>


       


    );
}

export default RestaurantManage;