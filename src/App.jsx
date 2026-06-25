import { BrowserRouter, Routes, Route } from "react-router-dom";

import Inventario from "./pages/Inventario";
import Produtos from "./pages/Produtos";
import Relatorios from "./pages/Relatorios";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inventario />} />

        <Route path="/produtos" element={<Produtos />} />

        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
