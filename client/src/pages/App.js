import Chatbot from '../pages/Chatbot';
import RestaurantManage from '../pages/RestaurantManage';
import {BrowserRouter as Router} from "react-router-dom";
import { Routes,Route} from "react-router-dom";


function App() {
  return (
    <div className="App">
      {/* <Chatbot /> */}
      <Router>
             <Routes >
                 {/* <Route path="/" element={<Table/>} /> */}
                 <Route path="/Chatbot" element={<Chatbot/>} />
                 <Route path="/RestaurantManage" element={<RestaurantManage/>} />

             </Routes>
        </Router>

    </div>
  );
}

export default App;
