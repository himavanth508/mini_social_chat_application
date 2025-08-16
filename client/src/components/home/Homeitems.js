import React from "react";
import { useContext } from "react";
import Comment from "../comment/Comment";
import { AppContext } from "../../context/appContext";
import axios from "axios";
export default function Homeitems(props) {
  const { user } = useContext(AppContext);
  const elem = props.elem;
  const handleDelete = async (id) => {
    const url = `http://localhost:8080/posts/${id}`;
    const result = await axios.delete(url, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
  };
  return (
    <div>
      <div>
        {elem.users[0].name} - {elem.Post}
        <button onClick={() => handleDelete(elem._id)}>Delete</button>
        <br></br>
        <img style={{ width: "100%" }} src={elem.file} />
      </div>
      {/* <Comment id={item.id}/> */}
    </div>
  );
}
