import React from "react";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { AppContext } from "../../context/appContext";
import { FaGoogle } from "react-icons/fa";

export default function GoogleLogin() {
    const { user, setUser, setFlag } =
    useContext(AppContext);
  const [usr, setUsr] = useState([]);


  const login = useGoogleLogin({
    onSuccess: (res) => setUsr(res),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (usr) {
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${usr.access_token}` )
        .then(async (res) => {
          user.name = res.data.name;
          user.email = res.data.email;
          const found = await axios.post(
            "http://localhost:8080/users/googleLogin/",
            user
          );
          setUser((prev) => ({
            ...prev,
            id: found.data.user._id,
            name: found.data.user.name,
            email: found.data.user.email,
            role: found.data.user.role,
            token: found.data.token,
          }));
          setFlag(() => 2);
        })
        .catch((err) => console.log(err));
    }
  }, [usr]);

  return (
    <>
      <button onClick={login}><FaGoogle size={12}/> Sign in with Google</button>
    </>
  );
}



// .get(
  // `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${usr.access_token}`,
  // {
  //   headers: {
  //     Authorization: `Bearer ${usr.access_token}`,
  //     Accept: "application/json",
  //   },
  // }
// )