import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useContext, createContext, useState } from "react";
import Login from "./components/user/Login.js";
import { AppContext } from "./context/appContext.js";
import Home from "./components/home/Home.js";
import Navbar from "./components/navbar/Navbar.js";
import Post from "./components/post/Post.js";
import Footer from "./components/footer/Footer.js";
function App() {
  const PATH = process.env.REACT_APP_PATH;
  const { flag, setFlag, user } = useContext(AppContext);

  return (
    <>
      {flag < 2 ? (
        <Login />
      ) : (
        <Router>
          <div className="App-head">
            <div className="App-title">social-mern </div>
            <div className="App-user">
              {" "}
              <Navbar />
            </div>
          </div>
          <div className="App">
            <div className="App-sidemenu">[{user.name}]</div>
            <div className="App-content">
              <Routes>
                <Route index path={`${PATH}/`} element={<Home />} />
                {/* <Route path={`${PATH}/post`} element={<Post />} /> */}
              </Routes>
            </div>
            <div className="App-sidemenu">fdfdsffdfsf</div>
          </div>

          <Footer />
        </Router>
      )}
    </>
  );
}
export default App;
