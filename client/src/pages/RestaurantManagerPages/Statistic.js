import React from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import '../../styles/Statistic.css'
function Statistic(props) {
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
                    <h1>Statistic</h1>
                    <div>
                        {/* <MenuBar/> */}
                    </div>

                </div>

            </main>
           
            </div>
    );
}

export default Statistic;