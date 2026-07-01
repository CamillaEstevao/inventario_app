import { useEffect, useState } from "react";
import {
  ClipboardList,
  Package,
  BarChart3,
  AlertTriangle,
  CalendarDays,
  ArrowRight,
  Boxes,
  Bell,
  User,
  ShoppingCart,
  ScanLine,
} from "lucide-react";
import { Link } from "react-router-dom";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [produtos, setProdutos] = useState([]);
  const [inventarios, setInventarios] = useState([]);
  const [ultimoInventario, setUltimoInventario] = useState(null);

  async function carregarDados() {
    const { data: produtosData, error: produtosError } = await supabase
      .from("produtos")
      .select("*")
      .order("quantidade", { ascending: true });

    if (!produtosError) {
      setProdutos(produtosData || []);
    }

    const { data: inventariosData, error: inventariosError } = await supabase
      .from("inventarios")
      .select("*")
      .order("data", { ascending: false })
      .limit(7);

    if (!inventariosError) {
      setInventarios(inventariosData || []);

      if (inventariosData && inventariosData.length > 0) {
        setUltimoInventario(inventariosData[0]);
      }
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function formatarData(data) {
    if (!data) return "Nenhum ainda";

    return new Date(data).toLocaleDateString("pt-BR");
  }

  function diasDesde(data) {
    if (!data) return "";

    const hoje = new Date();
    const dataInventario = new Date(data);
    const diff = hoje - dataInventario;
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (dias === 0) return "Hoje";
    if (dias === 1) return "Há 1 dia";

    return `Há ${dias} dias`;
  }

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

  const produtosComprar = produtos
    .filter((produto) => Number(produto.quantidade || 0) <= 10)
    .slice(0, 3);

  const maiorQuantidadeAlerta =
    produtosAcabando.length > 0
      ? Math.max(
          ...produtosAcabando.map((produto) => Number(produto.quantidade || 0)),
        )
      : 1;

  const inventariosOrdenados = [...inventarios].reverse();

  const maiorTotalInventario =
    inventariosOrdenados.length > 0
      ? Math.max(
          ...inventariosOrdenados.map((item) => Number(item.total_itens || 0)),
        )
      : 1;

  const totalConsumido =
    inventariosOrdenados.length >= 2
      ? Math.max(
          0,
          Number(inventariosOrdenados[0]?.total_itens || 0) -
            Number(
              inventariosOrdenados[inventariosOrdenados.length - 1]
                ?.total_itens || 0,
            ),
        )
      : 0;

  return (
    <div className="min-h-screen pb-28 bg-[#f5f7fb]">
      <header className="bg-[#102d5c] text-white p-5 rounded-b-3xl shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Inventário NX</p>
            <h1 className="text-3xl font-bold mt-1">Bom dia, Camilla 👋</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative bg-white/10 p-3 rounded-2xl">
              <Bell size={20} />
              {produtosAcabando.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {produtosAcabando.length}
                </span>
              )}
            </div>

            <div className="bg-white/10 p-3 rounded-2xl">
              <User size={20} />
            </div>
          </div>
        </div>

        <div className="mt-5 bg-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Último inventário</p>

            <strong className="text-xl flex items-center gap-2 mt-1">
              <CalendarDays size={20} />
              {formatarData(ultimoInventario?.data)}
            </strong>

            <p className="text-xs opacity-70 mt-1">
              {diasDesde(ultimoInventario?.data)}
            </p>
          </div>

          <ArrowRight />
        </div>
      </header>

      <main className="p-4 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 shadow">
            <div className="bg-blue-50 text-blue-700 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Package />
            </div>

            <p className="text-gray-500 mt-4">Produtos</p>
            <strong className="text-3xl">{totalProdutos}</strong>
            <p className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full inline-block mt-3">
              Cadastrados
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <div className="bg-green-50 text-green-700 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Boxes />
            </div>

            <p className="text-gray-500 mt-4">Estoque total</p>
            <strong className="text-3xl">{totalItens}</strong>
            <p className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full inline-block mt-3">
              Itens em estoque
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <div className="bg-red-50 text-red-600 w-12 h-12 rounded-2xl flex items-center justify-center">
              <AlertTriangle />
            </div>

            <p className="text-gray-500 mt-4">Críticos</p>
            <strong className="text-3xl">{produtosCriticos.length}</strong>
            <p className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full inline-block mt-3">
              Até 3 un.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <div className="bg-orange-50 text-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center">
              <BarChart3 />
            </div>

            <p className="text-gray-500 mt-4">Alertas</p>
            <strong className="text-3xl">{produtosAcabando.length}</strong>
            <p className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full inline-block mt-3">
              Estoque baixo
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">
              🔥 Produtos com estoque crítico
            </h2>

            <Link to="/produtos" className="text-sm text-blue-700 font-bold">
              Ver todos
            </Link>
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
                  <div key={produto.id} className="flex gap-3 items-center">
                    <img
                      src={produto.foto || "https://via.placeholder.com/80"}
                      alt={produto.nome}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <div>
                          <p className="font-bold leading-tight">
                            {produto.nome}
                          </p>
                          <p className="text-xs text-gray-400">
                            {produto.categoria || "Geral"}
                          </p>
                        </div>

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

                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            quantidade <= 3 ? "bg-red-500" : "bg-orange-400"
                          }`}
                          style={{ width: `${largura}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">📈 Consumo da semana</h2>

            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              Últimos inventários
            </span>
          </div>

          {inventariosOrdenados.length === 0 ? (
            <p className="text-gray-500">Nenhum dado para exibir.</p>
          ) : (
            <>
              <div className="h-44 flex items-end gap-3 border-b border-gray-100 pb-3">
                {inventariosOrdenados.map((item) => {
                  const total = Number(item.total_itens || 0);
                  const altura = Math.max(
                    12,
                    (total / maiorTotalInventario) * 100,
                  );

                  return (
                    <div
                      key={item.id}
                      className="flex-1 flex flex-col items-center justify-end"
                    >
                      <div
                        className="w-full bg-blue-600 rounded-t-xl"
                        style={{ height: `${altura}%` }}
                      />

                      <span className="text-[10px] text-gray-400 mt-2">
                        {new Date(item.data).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-blue-50 rounded-2xl p-3">
                  <p className="text-xs text-blue-700">Total atual</p>
                  <strong className="text-xl text-blue-900">
                    {ultimoInventario?.total_itens || 0}
                  </strong>
                </div>

                <div className="bg-green-50 rounded-2xl p-3">
                  <p className="text-xs text-green-700">Diferença</p>
                  <strong className="text-xl text-green-800">
                    {totalConsumido} itens
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-3xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">
              ⚠ Produtos que precisam comprar
            </h2>

            <Link to="/produtos" className="text-sm text-blue-700 font-bold">
              Ver todos
            </Link>
          </div>

          {produtosComprar.length === 0 ? (
            <p className="text-gray-500">Nenhum produto precisa de compra.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {produtosComprar.map((produto) => (
                <div
                  key={produto.id}
                  className="border rounded-2xl p-3 flex items-center gap-3"
                >
                  <img
                    src={produto.foto || "https://via.placeholder.com/80"}
                    alt={produto.nome}
                    className="w-14 h-14 rounded-xl object-cover bg-gray-100"
                  />

                  <div className="flex-1">
                    <p className="font-bold leading-tight">{produto.nome}</p>
                    <p className="text-sm text-gray-500">
                      Estoque: {produto.quantidade} un.
                    </p>
                  </div>

                  <div className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
                    Comprar
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-5 shadow">
          <h2 className="font-bold text-lg mb-4">Ações rápidas</h2>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/inventario"
              className="bg-[#102d5c] text-white rounded-2xl p-4 font-bold"
            >
              <ClipboardList />
              <p className="mt-2">Novo Inventário</p>
              <span className="text-xs opacity-80">Iniciar contagem</span>
            </Link>

            <Link
              to="/produtos"
              className="bg-white border rounded-2xl p-4 font-bold"
            >
              <Package />
              <p className="mt-2">Produtos</p>
              <span className="text-xs text-gray-400">Gerenciar</span>
            </Link>

            <Link
              to="/relatorios"
              className="bg-white border rounded-2xl p-4 font-bold"
            >
              <BarChart3 />
              <p className="mt-2">Relatórios</p>
              <span className="text-xs text-gray-400">Ver histórico</span>
            </Link>

            <button
              onClick={() => alert("Scanner será adicionado em breve")}
              className="bg-white border rounded-2xl p-4 font-bold text-left"
            >
              <ScanLine />
              <p className="mt-2">Scanner</p>
              <span className="text-xs text-gray-400">Cód. barras / QR</span>
            </button>
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
