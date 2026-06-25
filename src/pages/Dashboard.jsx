import { useEffect, useState } from "react";
import { ClipboardList, Package, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [totalItens, setTotalItens] = useState(0);
  const [ultimoInventario, setUltimoInventario] = useState(null);

  async function carregarDados() {
    const { data: produtos } = await supabase.from("produtos").select("*");

    if (produtos) {
      setTotalProdutos(produtos.length);

      const soma = produtos.reduce(
        (total, produto) => total + Number(produto.quantidade || 0),
        0
      );

      setTotalItens(soma);
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