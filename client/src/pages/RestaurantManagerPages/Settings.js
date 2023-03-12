import React from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import '../../styles/Settings.css'
function Settings(props) {
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
                    <h1>Settings</h1>
                    <div>
                        {/* <MenuBar/> */}
                    </div>

                </div>

            </main>
           
            </div>
    );
}

export default Settings;