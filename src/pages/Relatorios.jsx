import { useEffect, useState } from "react";
import { FileText, CalendarDays } from "lucide-react";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Relatorios() {
  const [inventarios, setInventarios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function buscarRelatorios() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("inventarios")
      .select(`
        id,
        data,
        total_itens,
        inventario_itens (
          id,
          quantidade,
          produtos (
            nome,
            foto
          )
        )
      `)
      .order("data", { ascending: false });

    if (error) {
      console.log(error);
      alert(error.message);
    } else {
      setInventarios(data || []);
    }

    setCarregando(false);
  }

  useEffect(() => {
    buscarRelatorios();
  }, []);

  return (
    <div className="min-h-screen pb-28">
      <header className="bg-[#102d5c] text-white p-5">
        <h1 className="text-xl font-bold">Relatórios</h1>
        <p className="text-sm opacity-80">Histórico de inventários</p>
      </header>

      <main className="p-4">
        {carregando && (
          <p className="text-center mt-6">Carregando...</p>
        )}

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
                  <h2 className="font-bold">
                    Inventário #{inventario.id}
                  </h2>

                  <p className="text-gray-500 flex gap-2 items-center">
                    <CalendarDays size={16} />
                    {new Date(inventario.data).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {inventario.inventario_itens?.length > 0 ? (
                  inventario.inventario_itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl"
                    >
                      <img
                        src={
                          item.produtos?.foto ||
                          "https://via.placeholder.com/80"
                        }
                        className="w-14 h-14 rounded-xl object-cover"
                      />

                      <div>
                        <h3 className="font-bold">
                          {item.produtos?.nome || "Produto removido"}
                        </h3>

                        <p className="text-gray-600">
                          Qtd: {item.quantidade}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 mt-3">
                    Este inventário não possui produtos.
                  </p>
                )}
              </div>

              <div className="mt-4 border-t pt-3">
                <p className="text-gray-400">Total de itens</p>
                <strong className="text-2xl">
                  {inventario.total_itens}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomMenu />
    </div>
  );
}