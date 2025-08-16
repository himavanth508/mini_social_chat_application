import React, { useContext, useState,useEffect,useRef } from "react";
import { useFetch } from "../../useFetch";
import { AppContext } from "../../context/appContext";
import axios from "axios";
export default function Comment(props) {
  const [comment, setComment] = useState();
  const refcomment = useRef()
  const [flg,setFlg]=useState(true)
  const [data, setData] = useState([]);
  const { user } = useContext(AppContext);
  useEffect(() => {
    const url = `http://localhost:8080/comments/${props.id}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, [flg]);

  const handleSubmit = async () => {
    const url = `http://localhost:8080/comments/${props.id}`;
    await axios.post(url, { comment: comment, userId: user.id });
    refcomment.current.value=""
    setFlg(!flg)
  };

  const handleDelete = async (id) => {
    const url = `http://localhost:8080/comments/${id}`;
    await axios.delete(url);
    setFlg(!flg)
  };
  return (
    <div>
      <details>
        <summary>Comments({data.length})</summary>
        <div>
          {data &&
            data.map((elem) => (
              <div key={elem._id}>
                <b>{elem.users[0].name}:</b>
                {elem.comment}
                {elem.userId === user.id && (
                  <button onClick={() => handleDelete(elem._id)}>Delete</button>
                )}
              </div>
            ))}
          <input
            type="text" ref={refcomment}
            placeholder="Add a comment..."
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={handleSubmit}>Post</button>
        </div>
      </details>
    </div>
  );
}
