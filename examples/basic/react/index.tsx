import React from 'react';
import { render } from "react-dom";

import "common-example/server"

import App from "./App"

const rootElement = document.getElementById("root");
render(<App />, rootElement);
