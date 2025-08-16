import React, { useContext } from "react";
import { useFetch } from "../../useFetch";
import Postitems from "./Postitems";
import "./Post.css"
import { AppContext } from "../../context/appContext";
export default function Post() {
  const {user} = useContext(AppContext)
  // const url = `https://jsonplaceholder.typicode.com/posts/?userId=${user.email}`;
  const url = `http://localhost:8080/post/`
  const data = useFetch(url);
  return (
    <div>
      <h1>My Posts</h1>
      <div className="Post-container">
        {data &&
          data.map((elem) => (
            <div key={elem._id}>
              <Postitems elem={elem} />
              <hr></hr>
            </div>
           
          ))}
      </div>
    </div>
  );
}

