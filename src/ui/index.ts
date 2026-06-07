import "./styles.css";
import composeApp from "../app/compose.ts";
import makeRenderApp from "./render/renderApp.ts";

const appRoot = document.querySelector<HTMLElement>("#app");

if (!appRoot) {
  throw new Error("Missing #app root");
}

const app = composeApp();
void makeRenderApp(appRoot, app.getReport)();
