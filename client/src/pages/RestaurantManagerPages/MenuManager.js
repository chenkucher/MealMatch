import React from 'react';
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import '../../styles/MenuManager.css'
function MenuManager(props) {
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
                    <h1>Menu Managment</h1>
                    <div>
                        {/* <MenuBar/> */}
                    </div>

                </div>




            </main>
            
        </div>
    );
}

export default MenuManager;