import { useEffect, useState } from "react";
import {
  FileText,
  CalendarDays,
  MessageCircle,
  BarChart3,
  ClipboardList,
  Package,
  Eye,
  X,
  TrendingUp,
} from "lucide-react";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Relatorios() {
  const [inventarios, setInventarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [detalhe, setDetalhe] = useState(null);

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

  function formatarData(data) {
    if (!data) return "-";

    return new Date(data).toLocaleDateString("pt-BR");
  }

  function enviarRelatorioWhatsApp(inventario) {
    let texto = "📊 RELATÓRIO DE INVENTÁRIO NX\n\n";

    texto += `Data: ${formatarData(inventario.data)}\n`;
    texto += `Total de itens: ${inventario.total_itens}\n\n`;

    inventario.inventario_itens.forEach((item) => {
      texto += `✅ ${item.produtos?.nome || "Produto removido"}\n`;
      texto += `Qtd: ${item.quantidade}\n\n`;
    });

    texto += "Gerado por Inventário NX\n";
    texto += "Powered by NexCode Studio";

    window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank");
  }

  const totalInventarios = inventarios.length;

  const ultimoInventario = inventarios[0];

  const totalItensAtual = Number(ultimoInventario?.total_itens || 0);

  const totalProdutosUltimo = ultimoInventario?.inventario_itens?.length || 0;

  const inventariosGrafico = [...inventarios].reverse().slice(-6);

  const maiorTotal =
    inventariosGrafico.length > 0
      ? Math.max(
          ...inventariosGrafico.map((inventario) =>
            Number(inventario.total_itens || 0),
          ),
        )
      : 1;

  return (
    <div className="min-h-screen pb-28 bg-[#f5f7fb]">
      <header className="bg-[#102d5c] text-white p-5 rounded-b-3xl shadow">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center">
            <BarChart3 size={30} />
          </div>

          <div>
            <p className="text-sm opacity-80">Inventário NX</p>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-sm opacity-80">Histórico de inventários</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {carregando && (
          <div className="bg-white rounded-3xl p-5 text-center shadow">
            Carregando relatórios...
          </div>
        )}

        {!carregando && inventarios.length === 0 && (
          <div className="bg-white rounded-3xl p-5 text-center shadow">
            Nenhum relatório salvo ainda.
          </div>
        )}

        {!carregando && inventarios.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 shadow">
                <ClipboardList className="text-[#102d5c]" />
                <p className="text-gray-500 mt-3">Inventários</p>
                <strong className="text-3xl">{totalInventarios}</strong>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow">
                <Package className="text-green-600" />
                <p className="text-gray-500 mt-3">Produtos</p>
                <strong className="text-3xl">{totalProdutosUltimo}</strong>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow">
                <BarChart3 className="text-blue-600" />
                <p className="text-gray-500 mt-3">Itens atuais</p>
                <strong className="text-3xl">{totalItensAtual}</strong>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow">
                <CalendarDays className="text-orange-500" />
                <p className="text-gray-500 mt-3">Último</p>
                <strong className="text-xl">
                  {formatarData(ultimoInventario?.data)}
                </strong>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <TrendingUp className="text-blue-600" />
                  Evolução do estoque
                </h2>

                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  últimos {inventariosGrafico.length}
                </span>
              </div>

              <div className="h-44 flex items-end gap-3 border-b border-gray-100 pb-3">
                {inventariosGrafico.map((inventario) => {
                  const total = Number(inventario.total_itens || 0);

                  const altura = Math.max(12, (total / maiorTotal) * 100);

                  return (
                    <div
                      key={inventario.id}
                      className="flex-1 flex flex-col items-center justify-end"
                    >
                      <div
                        className="w-full bg-blue-600 rounded-t-xl"
                        style={{ height: `${altura}%` }}
                      />

                      <span className="text-[10px] text-gray-400 mt-2">
                        {new Date(inventario.data).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow">
              <h2 className="font-bold text-lg mb-4">
                Timeline de inventários
              </h2>

              <div className="space-y-4">
                {inventarios.map((inventario) => (
                  <div
                    key={inventario.id}
                    className="border rounded-2xl p-4 bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div className="bg-blue-50 text-blue-700 w-12 h-12 rounded-2xl flex items-center justify-center">
                          <FileText />
                        </div>

                        <div>
                          <h3 className="font-bold">
                            Inventário #{inventario.id}
                          </h3>

                          <p className="text-sm text-gray-500 flex gap-2 items-center">
                            <CalendarDays size={16} />
                            {formatarData(inventario.data)}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {inventario.inventario_itens?.length || 0} produtos
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">Total</p>
                        <strong className="text-2xl text-[#102d5c]">
                          {inventario.total_itens}
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <button
                        onClick={() => setDetalhe(inventario)}
                        className="bg-gray-50 border p-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-[#102d5c]"
                      >
                        <Eye size={18} />
                        Ver detalhes
                      </button>

                      <button
                        onClick={() => enviarRelatorioWhatsApp(inventario)}
                        className="bg-[#102d5c] text-white p-3 rounded-2xl flex items-center justify-center gap-2 font-bold"
                      >
                        <MessageCircle size={18} />
                        WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-gray-400">
              Powered by NexCode Studio
            </p>
          </>
        )}
      </main>

      {detalhe && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl">Detalhes do inventário</h2>
                <p className="text-gray-500 text-sm">
                  {formatarData(detalhe.data)}
                </p>
              </div>

              <button onClick={() => setDetalhe(null)}>
                <X />
              </button>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 mt-4 text-center">
              <p className="text-blue-700 text-sm">Total de itens</p>
              <strong className="text-4xl text-blue-900">
                {detalhe.total_itens}
              </strong>
            </div>

            <div className="mt-4 space-y-2">
              {detalhe.inventario_itens?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between bg-gray-50 p-3 rounded-xl"
                >
                  <span>{item.produtos?.nome || "Produto removido"}</span>
                  <strong>{item.quantidade}</strong>
                </div>
              ))}
            </div>

            <button
              onClick={() => enviarRelatorioWhatsApp(detalhe)}
              className="mt-4 w-full bg-[#102d5c] text-white p-3 rounded-2xl font-bold flex justify-center gap-2"
            >
              <MessageCircle />
              Enviar WhatsApp
            </button>
          </div>
        </div>
      )}

      <BottomMenu />
    </div>
  );
}
