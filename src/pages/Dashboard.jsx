import { useEffect, useState } from "react";
import { ClipboardList, Package, BarChart3, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [produtos, setProdutos] = useState([]);
  const [ultimoInventario, setUltimoInventario] = useState(null);

  async function carregarDados() {
    const { data: produtosData, error: produtosError } = await supabase
      .from("produtos")
      .select("*")
      .order("quantidade", { ascending: true });

    if (!produtosError) {
      setProdutos(produtosData || []);
    }

    const { data: inventarios } = await supabase
      .from("inventarios")
      .select("*")
      .order("data", { ascending: false })
      .limit(1);

    if (inventarios && inventarios.length > 0) {
      setUltimoInventario(inventarios[0]);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const totalProdutos = produtos.length;

  const totalItens = produtos.reduce(
    (total, produto) => total + Number(produto.quantidade || 0),
    0,
  );

  const produtosAcabando = produtos
    .filter((produto) => Number(produto.quantidade || 0) <= 10)
    .slice(0, 6);

  const maiorQuantidadeAlerta =
    produtosAcabando.length > 0
      ? Math.max(
          ...produtosAcabando.map((produto) => Number(produto.quantidade || 0)),
        )
      : 1;

  return (
    <div className="min-h-screen pb-28 bg-gray-100">
      <header className="bg-[#102d5c] text-white p-5">
        <h1 className="text-2xl font-bold">Inventário App</h1>
        <p className="text-sm opacity-80">Bom dia, Camilla 👋</p>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow">
          <p className="text-gray-500">Último inventário</p>

          <strong className="text-xl">
            {ultimoInventario
              ? new Date(ultimoInventario.data).toLocaleDateString("pt-BR")
              : "Nenhum ainda"}
          </strong>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow">
            <Package />
            <p className="text-gray-500 mt-3">Produtos</p>
            <strong className="text-3xl">{totalProdutos}</strong>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <BarChart3 />
            <p className="text-gray-500 mt-3">Itens</p>
            <strong className="text-3xl">{totalItens}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-orange-500" />
            <h2 className="font-bold text-lg">Produtos acabando</h2>
          </div>

          {produtosAcabando.length === 0 ? (
            <p className="text-gray-500">Nenhum produto em estoque baixo.</p>
          ) : (
            <div className="space-y-4">
              {produtosAcabando.map((produto) => {
                const quantidade = Number(produto.quantidade || 0);
                const largura = Math.max(
                  8,
                  (quantidade / maiorQuantidadeAlerta) * 100,
                );

                return (
                  <div key={produto.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{produto.nome}</span>
                      <span className="text-gray-500">{quantidade} un.</span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          quantidade <= 3 ? "bg-red-500" : "bg-orange-400"
                        }`}
                        style={{ width: `${largura}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Link
          to="/inventario"
          className="bg-[#102d5c] text-white rounded-xl p-4 font-bold flex justify-center gap-2"
        >
          <ClipboardList />
          Novo Inventário
        </Link>
      </main>

      <BottomMenu />
    </div>
  );
}
