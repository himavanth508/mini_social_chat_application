import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./app.jsx";
import './styles/app.css';

const container = document.getElementById("root");
const root = createRoot(container);
console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
root.render(
  <StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);