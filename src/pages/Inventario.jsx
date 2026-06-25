import { useEffect, useState } from "react";
import {
  Search,
  Minus,
  Plus,
  Save,
  MessageCircle,
  CheckCircle,
} from "lucide-react";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Inventario() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function buscarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("nome", { ascending: true });

    if (!error) {
      setProdutos(
        data.map((produto) => ({
          ...produto,
          contado: false,
        }))
      );
    }
  }

  useEffect(() => {
    buscarProdutos();
  }, []);

  function alterarQuantidade(id, valor) {
    setProdutos((lista) =>
      lista.map((produto) =>
        produto.id === id
          ? {
              ...produto,
              quantidade: Math.max(0, Number(produto.quantidade || 0) + valor),
              contado: true,
            }
          : produto
      )
    );
  }

  function digitarQuantidade(id, valor) {
    setProdutos((lista) =>
      lista.map((produto) =>
        produto.id === id
          ? {
              ...produto,
              quantidade: Math.max(0, Number(valor || 0)),
              contado: true,
            }
          : produto
      )
    );
  }

  async function salvarInventario() {
    setSalvando(true);

    const total = produtos.reduce(
      (soma, produto) => soma + Number(produto.quantidade || 0),
      0
    );

    const { data: inventario, error } = await supabase
      .from("inventarios")
      .insert({
        total_itens: total,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setSalvando(false);
      return;
    }

    const itens = produtos.map((produto) => ({
      inventario_id: inventario.id,
      produto_id: produto.id,
      quantidade: Number(produto.quantidade || 0),
    }));

    await supabase.from("inventario_itens").insert(itens);

    for (const produto of produtos) {
      await supabase
        .from("produtos")
        .update({
          quantidade: Number(produto.quantidade || 0),
        })
        .eq("id", produto.id);
    }

    alert("Inventário salvo com sucesso!");
    setSalvando(false);
    buscarProdutos();
  }

  function enviarWhatsApp() {
    let texto = "📦 INVENTÁRIO\n\n";

    produtos.forEach((produto) => {
      texto += `${produto.nome} - Qtd: ${produto.quantidade}\n`;
    });

    texto += `\nTotal de itens: ${totalItens}`;

    window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank");
  }

  const filtrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totalItens = produtos.reduce(
    (soma, produto) => soma + Number(produto.quantidade || 0),
    0
  );

  const produtosContados = produtos.filter((produto) => produto.contado).length;

  const progresso =
    produtos.length > 0 ? Math.round((produtosContados / produtos.length) * 100) : 0;

  return (
    <div className="min-h-screen pb-32 bg-gray-100">
      <header className="bg-[#102d5c] text-white p-5">
        <h1 className="text-2xl font-bold">Inventário</h1>

        <p className="text-sm opacity-80">
          {produtosContados} de {produtos.length} produtos conferidos
        </p>

        <div className="w-full bg-white/20 rounded-full h-2 mt-3">
          <div
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </header>

      <main className="p-4">
        <div className="bg-white rounded-xl p-3 flex gap-2 shadow mb-4">
          <Search />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="outline-none w-full bg-transparent"
          />
        </div>

        <div className="space-y-4">
          {filtrados.map((produto) => (
            <div
              key={produto.id}
              className={`bg-white rounded-2xl p-4 shadow border transition-all ${
                produto.contado ? "border-green-500" : "border-transparent"
              }`}
            >
              <div className="flex gap-4 items-center">
                <img
                  src={produto.foto || "https://via.placeholder.com/100"}
                  alt={produto.nome}
                  className="w-20 h-20 rounded-xl object-cover bg-gray-100"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg leading-tight">
                      {produto.nome}
                    </h2>

                    {produto.contado && (
                      <CheckCircle size={18} className="text-green-600" />
                    )}
                  </div>

                  <p className="text-sm text-gray-400">
                    {produto.contado ? "Conferido" : "Aguardando contagem"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => alterarQuantidade(produto.id, -1)}
                  className="bg-gray-100 rounded-full p-3"
                >
                  <Minus />
                </button>

                <input
                  type="number"
                  inputMode="numeric"
                  value={produto.quantidade}
                  onChange={(e) => digitarQuantidade(produto.id, e.target.value)}
                  className="w-28 text-center text-3xl font-bold border rounded-xl p-2"
                />

                <button
                  onClick={() => alterarQuantidade(produto.id, 1)}
                  className="bg-gray-100 rounded-full p-3"
                >
                  <Plus />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow mt-5">
          <p className="text-gray-500">Total de itens</p>
          <strong className="text-3xl">{totalItens}</strong>
        </div>

        <button
          onClick={salvarInventario}
          disabled={salvando}
          className="mt-5 w-full bg-green-600 text-white p-4 rounded-xl font-bold flex justify-center gap-2"
        >
          <Save />
          {salvando ? "Salvando..." : "Salvar Inventário"}
        </button>

        <button
          onClick={enviarWhatsApp}
          className="mt-3 w-full bg-[#102d5c] text-white p-4 rounded-xl font-bold flex justify-center gap-2"
        >
          <MessageCircle />
          Enviar WhatsApp
        </button>
      </main>

      <BottomMenu />
    </div>
  );
}