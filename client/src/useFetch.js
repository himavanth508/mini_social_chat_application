import { useState, useEffect, useContext } from "react";
import { AppContext } from "./context/appContext";
import axios from "axios";
export const useFetch = (url,flag=0) => {
  const [data, setData] = useState([]);
  const { user } = useContext(AppContext);
  const fetchData = async (url) => {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setData(() => response.data);
  };

  useEffect(() => {
    fetchData(url);
  }, [url,flag]);
  return data;
};
