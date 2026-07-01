import {
  Home,
  ClipboardList,
  Package,
  BarChart3,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function BottomMenu() {
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

      <Link to="/configuracoes" className="flex flex-col items-center">
        <Settings />
        <span className="text-xs">Ajustes</span>
      </Link>
    </div>
  );
}
