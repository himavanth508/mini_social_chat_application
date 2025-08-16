import React from "react";
import { useContext } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { AppContext } from "../../context/appContext";
export default function Navbar() {
  const { user, setUser, setFlag } = useContext(AppContext);
  const PATH = process.env.REACT_APP_PATH;
  const handleLogout = () => {
    setUser((prev) => ({ ...prev, ...{ name: "", email: "", pass: "" } }));
    setFlag((prev) => 0);
  };
  return (
    <div className="navbar">
      <Link className="links" to={`${PATH}/`}>
        {" "}
        Home{" "}
      </Link>

      {/* <Link className="links" to={`${PATH}/post`}> Post </Link> */}

      <Link className="links" to={`${PATH}/`} onClick={handleLogout}>
        Logout
      </Link>
    </div>
  );
}
