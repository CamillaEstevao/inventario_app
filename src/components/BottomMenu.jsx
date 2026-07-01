import {
  Home,
  ClipboardList,
  Package,
  BarChart3,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function BottomMenu() {
  const menus = [
    {
      to: "/",
      label: "Home",
      icon: Home,
      end: true,
    },
    {
      to: "/inventario",
      label: "Inventário",
      icon: ClipboardList,
    },
    {
      to: "/produtos",
      label: "Produtos",
      icon: Package,
    },
    {
      to: "/relatorios",
      label: "Relatórios",
      icon: BarChart3,
    },
    {
      to: "/configuracoes",
      label: "Ajustes",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      <div className="bg-white/95 backdrop-blur border border-gray-100 shadow-2xl rounded-3xl px-2 py-2 flex justify-between">
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 min-w-[62px] transition-all duration-200 ${
                  isActive
                    ? "bg-[#102d5c] text-white shadow-lg scale-105"
                    : "text-gray-400 hover:text-[#102d5c] hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.8 : 2.2}
                    className="transition-all duration-200"
                  />

                  <span className="text-[11px] font-bold leading-none">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
