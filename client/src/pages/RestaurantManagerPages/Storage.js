import React from 'react';
import '../../styles/Storage.css'
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import StorageTable from '../components/RestaurantManager/StorageTable';

function Storage(props) {
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
                    <h1>Storage Managment</h1>
                    <div>
                        <StorageTable/>
                    </div>

                </div>

            </main>
           
            </div>
    );
}

export default Storage;