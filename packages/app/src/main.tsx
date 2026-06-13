import { render } from "solid-js/web";
import { App } from "#app";
import "#styles.css" with { type: "css" };

const app = document.getElementById("app");

if (!app) throw new Error("App element not found");

render(() => <App />, app);
