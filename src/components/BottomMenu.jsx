import { Home, ClipboardList, Package, BarChart3, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function BottomMenu() {
  const navigate = useNavigate();

  async function sair() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around shadow-lg z-50">
      <Link to="/" className="flex flex-col items-center">
        <Home />
        <span className="text-xs">Home</span>
      </Link>

      <Link to="/inventario" className="flex flex-col items-center">
        <ClipboardList />
        <span className="text-xs">Inventário</span>
      </Link>

      <Link to="/produtos" className="flex flex-col items-center">
        <Package />
        <span className="text-xs">Produtos</span>
      </Link>

      <Link to="/relatorios" className="flex flex-col items-center">
        <BarChart3 />
        <span className="text-xs">Relatórios</span>
      </Link>

      <button
        onClick={sair}
        className="flex flex-col items-center text-red-500"
      >
        <LogOut />
        <span className="text-xs">Sair</span>
      </button>
    </div>
  );
}
