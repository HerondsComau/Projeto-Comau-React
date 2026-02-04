import React from "react";
import ReactDOM from "react-dom/client";
import "./estilos.css";
import Chart from "chart.js/auto";
import "./legado/ponte";
import Aplicacao from "./aplicacao.jsx";

window.Chart = Chart;

ReactDOM.createRoot(document.getElementById("root")).render(<Aplicacao />);

