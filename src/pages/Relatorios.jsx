import { useEffect, useState } from "react";
import { FileText, CalendarDays } from "lucide-react";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Relatorios() {
  const [inventarios, setInventarios] = useState([]);

  const [carregando, setCarregando] = useState(true);

  async function buscarRelatorios() {
    const { data, error } = await supabase

      .from("inventarios")

      .select("*")

      .order("data", { ascending: false });

    if (!error) {
      setInventarios(data);
    }

    setCarregando(false);
  }

  useEffect(() => {
    buscarRelatorios();
  }, []);

  return (
    <div className="min-h-screen pb-28">
      <header
        className="
bg-[#102d5c]
text-white
p-5
shadow
"
      >
        <h1 className="text-xl font-bold">Relatórios</h1>

        <p className="text-sm">Histórico de inventários</p>
      </header>

      <main className="p-4">
        {carregando && <p className="text-center">Carregando...</p>}

        <div className="space-y-4">
          {inventarios.map((item) => (
            <div
              key={item.id}
              className="
bg-white
rounded-2xl
p-4
shadow-md
"
            >
              <div className="flex gap-3 items-center">
                <FileText />

                <div>
                  <h2 className="font-bold">Inventário #{item.id}</h2>

                  <p className="text-gray-500 flex gap-2 items-center">
                    <CalendarDays size={16} />

                    {new Date(item.data).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-400">Total de itens</p>

                <strong className="text-3xl">{item.total_itens}</strong>
              </div>
            </div>
          ))}

          {inventarios.length === 0 && !carregando && (
            <div
              className="
bg-white
p-5
rounded-xl
text-center
"
            >
              Nenhum inventário salvo ainda
            </div>
          )}
        </div>
      </main>

      <BottomMenu />
    </div>
  );
}
