import { useEffect, useState } from "react";
import { FileText, CalendarDays, MessageCircle } from "lucide-react";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Relatorios() {
  const [inventarios, setInventarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function buscarRelatorios() {
    const { data, error } = await supabase
      .from("inventarios")
      .select(
        `
        id,
        data,
        total_itens,
        inventario_itens (
          id,
          quantidade,
          produtos (
            nome
          )
        )
      `,
      )
      .order("data", { ascending: false });

    if (!error) {
      setInventarios(data || []);
    }

    setCarregando(false);
  }

  useEffect(() => {
    buscarRelatorios();
  }, []);

  function enviarRelatorioWhatsApp(inventario) {
    let texto = "📦 INVENTÁRIO\n\n";

    inventario.inventario_itens.forEach((item) => {
      texto += `✅ ${item.produtos?.nome || "Produto removido"}\n`;
      texto += `Qtd: ${item.quantidade}\n\n`;
    });

    window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank");
  }

  return (
    <div className="min-h-screen pb-28 bg-gray-100">
      <header className="bg-[#102d5c] text-white p-5">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm opacity-80">Histórico de inventários</p>
      </header>

      <main className="p-4">
        {carregando && <p className="text-center mt-5">Carregando...</p>}

        {!carregando && inventarios.length === 0 && (
          <div className="bg-white rounded-xl p-5 text-center shadow">
            Nenhum relatório salvo ainda.
          </div>
        )}

        <div className="space-y-5">
          {inventarios.map((inventario) => (
            <div
              key={inventario.id}
              className="bg-white rounded-2xl p-4 shadow"
            >
              <div className="flex gap-3 items-center">
                <FileText />

                <div>
                  <h2 className="font-bold">Inventário #{inventario.id}</h2>

                  <p className="text-gray-500 flex gap-2 items-center">
                    <CalendarDays size={16} />
                    {new Date(inventario.data).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {inventario.inventario_itens?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between bg-gray-50 p-3 rounded-xl"
                  >
                    <span>{item.produtos?.nome || "Produto removido"}</span>
                    <strong>{item.quantidade}</strong>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-3 flex justify-between">
                <span className="text-gray-500">Total de itens</span>
                <strong className="text-xl">{inventario.total_itens}</strong>
              </div>

              <button
                onClick={() => enviarRelatorioWhatsApp(inventario)}
                className="mt-4 w-full bg-[#102d5c] text-white p-3 rounded-xl font-bold flex justify-center gap-2"
              >
                <MessageCircle />
                Enviar WhatsApp
              </button>
            </div>
          ))}
        </div>
      </main>

      <BottomMenu />
    </div>
  );
}
