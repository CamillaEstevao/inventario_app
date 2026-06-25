import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Inventario from "./pages/Inventario";
import Produtos from "./pages/Produtos";
import Relatorios from "./pages/Relatorios";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;