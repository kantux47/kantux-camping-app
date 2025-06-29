import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import outputs from "../amplify_outputs.json";
import { Amplify } from "aws-amplify";
import { fetchAuthSession, signInWithRedirect } from "aws-amplify/auth";

Amplify.configure(outputs);

async function init() {
  try {
    await fetchAuthSession();
  } catch {
    await signInWithRedirect();
    return;
  }

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

init();