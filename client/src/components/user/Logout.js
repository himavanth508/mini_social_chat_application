import React, { useContext, useState } from "react";
import { AppContext } from "../../context/appContext";
export default function Logout() {
  const { user, setuser } = useContext(AppContext);
  return (
    <div>
      <button onClick={() => setuser((prev) => {})}>Logout</button>
    </div>
  );
}
