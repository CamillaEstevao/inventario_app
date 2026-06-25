import { useEffect, useState } from "react";
import { Search, Menu, MessageCircle, Plus, Minus } from "lucide-react";
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

      .order("id", { ascending: false });

    if (!error) {
      setProdutos(data);
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

              quantidade: Math.max(0, produto.quantidade + valor),
            }
          : produto,
      ),
    );
  }

  async function salvarInventario() {
    setSalvando(true);

    const total = produtos.reduce(
      (soma, p) => soma + Number(p.quantidade),

      0,
    );

    const { data, error } = await supabase

      .from("inventarios")

      .insert([
        {
          total_itens: total,
        },
      ])

      .select()

      .single();

    if (error) {
      alert(error.message);

      setSalvando(false);

      return;
    }

    const itens = produtos.map((produto) => ({
      inventario_id: data.id,

      produto_id: produto.id,

      quantidade: produto.quantidade,
    }));

    await supabase

      .from("inventario_itens")

      .insert(itens);

    // ATUALIZA ESTOQUE REAL

    for (const produto of produtos) {
      await supabase

        .from("produtos")

        .update({
          quantidade: produto.quantidade,
        })

        .eq(
          "id",

          produto.id,
        );
    }

    alert("Inventário salvo e estoque atualizado!");

    setSalvando(false);
  }

  function enviarWhatsApp() {
    let texto = "📦 INVENTÁRIO\n\n";

    produtos.forEach((produto) => {
      texto += `✅ ${produto.nome}\nQtd: ${produto.quantidade}\n\n`;
    });

    window.open(
      "https://wa.me/?text=" + encodeURIComponent(texto),

      "_blank",
    );
  }

  const filtrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="min-h-screen pb-28">
      <header
        className="
bg-[#102d5c]
text-white
p-5
flex
justify-between
items-center
shadow
"
      >
        <Menu />

        <h1 className="text-xl font-bold">Inventário</h1>

        <MessageCircle />
      </header>

      <main className="p-4">
        <div
          className="
bg-white
rounded-xl
p-3
flex
gap-2
shadow
"
        >
          <Search />

          <input
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="outline-none w-full"
          />
        </div>

        <div className="mt-5 space-y-4">
          {filtrados.map((produto) => (
            <div
              key={produto.id}
              className="
bg-white
rounded-2xl
p-4
shadow-md
flex
items-center
gap-4
"
            >
              <img
                src={produto.foto || "https://via.placeholder.com/100"}
                className="
w-20
h-20
rounded-xl
object-cover
"
              />

              <div className="flex-1">
                <h2 className="font-bold">{produto.nome}</h2>

                <p className="text-gray-400">Quantidade</p>
              </div>

              <button
                onClick={() => alterarQuantidade(produto.id, -1)}
                className="
bg-gray-100
rounded-full
p-2
"
              >
                <Minus />
              </button>

              <strong className="text-2xl">{produto.quantidade}</strong>

              <button
                onClick={() => alterarQuantidade(produto.id, 1)}
                className="
bg-gray-100
rounded-full
p-2
"
              >
                <Plus />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={salvarInventario}
          disabled={salvando}
          className="
mt-6
w-full
bg-green-600
text-white
p-4
rounded-xl
font-bold
"
        >
          {salvando ? "Salvando..." : "Salvar Inventário"}
        </button>

        <button
          onClick={enviarWhatsApp}
          className="
mt-3
w-full
bg-[#102d5c]
text-white
p-4
rounded-xl
font-bold
flex
justify-center
gap-2
"
        >
          <MessageCircle />
          Enviar WhatsApp
        </button>
      </main>

      <BottomMenu />
    </div>
  );
}
