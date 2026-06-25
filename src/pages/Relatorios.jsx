import { useEffect, useState } from "react";
import { FileText, CalendarDays } from "lucide-react";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Relatorios() {
  const [inventarios, setInventarios] = useState([]);

  const [carregando, setCarregando] = useState(true);

  async function buscar() {
    const { data, error } = await supabase

      .from("inventarios")

      .select(
        `

id,
created_at,
total_itens,

inventario_itens (

quantidade,

produtos (

nome,
foto

)

)

`,
      )

      .order("created_at", {
        ascending: false,
      });

    if (!error) {
      setInventarios(data);
    }

    setCarregando(false);
  }

  useEffect(() => {
    buscar();
  }, []);

  return (
    <div className="min-h-screen pb-28">
      <header
        className="
bg-[#102d5c]
text-white
p-5
"
      >
        <h1 className="text-xl font-bold">Relatórios</h1>
      </header>

      <main className="p-4">
        {inventarios.map((inv) => (
          <div
            key={inv.id}
            className="
bg-white
rounded-2xl
p-4
shadow
mb-5
"
          >
            <div className="flex gap-3">
              <FileText />

              <div>
                <h2 className="font-bold">Inventário #{inv.id}</h2>

                <p className="flex gap-2 text-gray-500">
                  <CalendarDays size={16} />

                  {new Date(inv.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {inv.inventario_itens.map((item) => (
                <div
                  key={item.id}
                  className="
flex
items-center
gap-3
bg-gray-50
p-3
rounded-xl
"
                >
                  <img
                    src={
                      item.produtos?.foto || "https://via.placeholder.com/60"
                    }
                    className="
w-14
h-14
rounded-xl
object-cover
"
                  />

                  <div>
                    <strong>{item.produtos?.nome}</strong>

                    <p>Qtd: {item.quantidade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {inventarios.length === 0 && (
          <p className="text-center">Nenhum inventário</p>
        )}
      </main>

      <BottomMenu />
    </div>
  );
}
