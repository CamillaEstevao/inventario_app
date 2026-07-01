import { useEffect, useState } from "react";
import {
  ClipboardList,
  Package,
  BarChart3,
  AlertTriangle,
  CalendarDays,
  ArrowRight,
  Boxes,
} from "lucide-react";
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

  const produtosCriticos = produtos.filter(
    (produto) => Number(produto.quantidade || 0) <= 3,
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
      <header className="bg-[#102d5c] text-white p-5 rounded-b-3xl shadow">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventário NX</h1>
            <p className="text-sm opacity-80">Bom dia, Camilla 👋</p>
          </div>

          <div className="bg-white/10 px-3 py-1 rounded-full text-xs">v2.0</div>
        </div>

        <div className="mt-5 bg-white/10 rounded-2xl p-4">
          <p className="text-sm opacity-80">Último inventário</p>

          <strong className="text-xl flex items-center gap-2 mt-1">
            <CalendarDays size={20} />
            {ultimoInventario
              ? new Date(ultimoInventario.data).toLocaleDateString("pt-BR")
              : "Nenhum ainda"}
          </strong>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow">
            <Package className="text-[#102d5c]" />
            <p className="text-gray-500 mt-3">Produtos</p>
            <strong className="text-3xl">{totalProdutos}</strong>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <Boxes className="text-[#102d5c]" />
            <p className="text-gray-500 mt-3">Estoque</p>
            <strong className="text-3xl">{totalItens}</strong>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <AlertTriangle className="text-red-500" />
            <p className="text-gray-500 mt-3">Críticos</p>
            <strong className="text-3xl">{produtosCriticos.length}</strong>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <BarChart3 className="text-green-600" />
            <p className="text-gray-500 mt-3">Alertas</p>
            <strong className="text-3xl">{produtosAcabando.length}</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-orange-500" />
              <h2 className="font-bold text-lg">Produtos acabando</h2>
            </div>

            <span className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
              Até 10 un.
            </span>
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

                      <span
                        className={
                          quantidade <= 3
                            ? "text-red-500 font-bold"
                            : "text-orange-500 font-bold"
                        }
                      >
                        {quantidade} un.
                      </span>
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

        <div className="bg-white rounded-2xl p-5 shadow">
          <h2 className="font-bold text-lg mb-4">Ações rápidas</h2>

          <div className="space-y-3">
            <Link
              to="/inventario"
              className="bg-[#102d5c] text-white rounded-xl p-4 font-bold flex justify-between items-center"
            >
              <span className="flex items-center gap-2">
                <ClipboardList />
                Novo Inventário
              </span>

              <ArrowRight />
            </Link>

            <Link
              to="/produtos"
              className="bg-white border rounded-xl p-4 font-bold flex justify-between items-center"
            >
              <span className="flex items-center gap-2">
                <Package />
                Gerenciar Produtos
              </span>

              <ArrowRight />
            </Link>

            <Link
              to="/relatorios"
              className="bg-white border rounded-xl p-4 font-bold flex justify-between items-center"
            >
              <span className="flex items-center gap-2">
                <BarChart3 />
                Ver Relatórios
              </span>

              <ArrowRight />
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          Powered by NexCode Studio
        </p>
      </main>

      <BottomMenu />
    </div>
  );
}
