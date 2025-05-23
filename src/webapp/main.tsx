import ReactDOM from "react-dom/client";
import { MainApp } from "./pages/app/MainApp";

const domElementId = "root";
const root = document.getElementById(domElementId);
if (!root) throw new Error(`Root DOM element not found: id=${domElementId}`);
ReactDOM.createRoot(root).render(<MainApp />);