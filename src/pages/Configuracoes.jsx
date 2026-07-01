import {
  User,
  Building2,
  Smartphone,
  Shield,
  Info,
  LogOut,
  Wifi,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Configuracoes() {
  const navigate = useNavigate();

  async function sair() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen pb-28 bg-[#f5f7fb]">
      <header className="bg-[#102d5c] text-white p-5 rounded-b-3xl shadow">
        <h1 className="text-3xl font-bold">Ajustes</h1>
        <p className="text-sm opacity-80">Configurações do Inventário NX</p>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow">
          <div className="flex items-center gap-4">
            <div className="bg-[#102d5c] text-white w-16 h-16 rounded-2xl flex items-center justify-center">
              <User size={30} />
            </div>

            <div>
              <h2 className="font-bold text-xl">Camilla Estevão</h2>
              <p className="text-sm text-gray-500">Usuária do sistema</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow overflow-hidden">
          <div className="p-4 border-b flex gap-3 items-center">
            <Building2 className="text-[#102d5c]" />
            <div>
              <h2 className="font-bold">Empresa</h2>
              <p className="text-sm text-gray-500">NexCode Studio</p>
            </div>
          </div>

          <div className="p-4 border-b flex gap-3 items-center">
            <Smartphone className="text-[#102d5c]" />
            <div>
              <h2 className="font-bold">Aplicativo</h2>
              <p className="text-sm text-gray-500">
                Inventário NX instalado como app
              </p>
            </div>
          </div>

          <div className="p-4 border-b flex gap-3 items-center">
            <Wifi className="text-green-600" />
            <div>
              <h2 className="font-bold">Sincronização</h2>
              <p className="text-sm text-gray-500">Online com Supabase</p>
            </div>
          </div>

          <div className="p-4 border-b flex gap-3 items-center">
            <Shield className="text-[#102d5c]" />
            <div>
              <h2 className="font-bold">Segurança</h2>
              <p className="text-sm text-gray-500">Login protegido</p>
            </div>
          </div>

          <div className="p-4 flex gap-3 items-center">
            <Info className="text-[#102d5c]" />
            <div>
              <h2 className="font-bold">Sobre</h2>
              <p className="text-sm text-gray-500">Versão 1.0.0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow text-center">
          <div className="bg-[#102d5c] text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold">NX</span>
          </div>

          <h2 className="text-2xl font-bold text-[#102d5c]">Inventário NX</h2>
          <p className="text-gray-500">Controle inteligente de estoque</p>

          <div className="mt-5 text-sm text-gray-500">
            <p>Desenvolvido por</p>
            <p className="font-bold text-[#102d5c]">NexCode Studio</p>
            <p>nexcodestudio.com.br</p>
          </div>

          <p className="text-xs text-gray-400 mt-5">
            © 2026 NexCode Studio. Todos os direitos reservados.
          </p>
        </div>

        <button
          onClick={sair}
          className="w-full bg-red-50 text-red-600 p-4 rounded-2xl font-bold flex justify-center gap-2"
        >
          <LogOut />
          Sair da conta
        </button>
      </main>

      <BottomMenu />
    </div>
  );
}
