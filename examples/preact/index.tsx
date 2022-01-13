import { render, h } from 'preact';

import "common-example/server"

import App from "./App"

const rootElement = document.getElementById("root")!;
render(<App />, rootElement);
