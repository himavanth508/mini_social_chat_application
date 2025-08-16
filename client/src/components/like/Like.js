import React, { useContext, useState,useEffect } from "react";
import { useFetch } from "../../useFetch";
import { AppContext } from "../../context/appContext";
import axios from "axios";
export default function Like(props) {
  // const [comment, setComment] = useState();
  const [data, setData] = useState([]);
  const { user } = useContext(AppContext);
  const [flg,setFlg]=useState(true)
  // const url = `http://localhost:8080/likes/${props.id}`;
  // const data = useFetch(url);
  const found = data && data.filter((e) => e.userId === user.id);
  const toggleLike = async () => {
    const url = `http://localhost:8080/likes/${user.id}/${props.id}`;
    console.log(user.name);
    await axios.post(url);
    setFlg(!flg)
  };

  useEffect(() => {
    const url = `http://localhost:8080/likes/${props.id}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, [flg]);

  return (
    <div>
      <button
        className={found.length>0 ? "Home-like-green" : "Home-like-silver"}
        onClick={toggleLike}
      >
        Likes({data.length})
      </button>

      {/* <details>
        <summary>Likes({data.length})</summary>
        <div>
          {data &&
            data.map((elem) => (
              <li key={elem._id}>
                {elem.username}- {elem.comment}-<button onClick={()=>handleDelete(elem._id)}>Delete</button>
              </li>
            ))}
          <input
            type="text"
            placeholder="Add a comment..."
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={handleSubmit}>Post</button>
        </div>
      </details> */}
    </div>
  );
}
