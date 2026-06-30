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
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [salvando, setSalvando] = useState(false);

  async function buscarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("nome", { ascending: true });

    if (!error) {
      setProdutos(
        data.map((produto) => {
          const total = Number(produto.quantidade || 0);
          const unidadesPorPacote = Number(produto.unidades_por_pacote || 1);
          const tipoContagem = produto.tipo_contagem || "unidade";

          return {
            ...produto,
            categoria: produto.categoria || "Geral",
            tipo_contagem: tipoContagem,
            unidades_por_pacote: unidadesPorPacote,

            pacotes:
              tipoContagem === "pacote"
                ? Math.floor(total / unidadesPorPacote)
                : 0,

            unidades_avulsas:
              tipoContagem === "pacote" ? total % unidadesPorPacote : total,

            contado: false,
          };
        }),
      );
    }
  }

  useEffect(() => {
    buscarProdutos();
  }, []);

  function calcularTotal(produto) {
    if (produto.tipo_contagem === "pacote") {
      return (
        Number(produto.pacotes || 0) *
          Number(produto.unidades_por_pacote || 1) +
        Number(produto.unidades_avulsas || 0)
      );
    }

    return Number(produto.unidades_avulsas || 0);
  }

  function alterarCampo(id, campo, valor) {
    setProdutos((lista) =>
      lista.map((produto) =>
        produto.id === id
          ? {
              ...produto,
              [campo]: Math.max(0, Number(produto[campo] || 0) + valor),
              contado: true,
            }
          : produto,
      ),
    );
  }

  function digitarCampo(id, campo, valor) {
    setProdutos((lista) =>
      lista.map((produto) =>
        produto.id === id
          ? {
              ...produto,
              [campo]: Math.max(0, Number(valor || 0)),
              contado: true,
            }
          : produto,
      ),
    );
  }

  async function salvarInventario() {
    setSalvando(true);

    const total = produtos.reduce(
      (soma, produto) => soma + calcularTotal(produto),
      0,
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
      quantidade: calcularTotal(produto),
      pacotes:
        produto.tipo_contagem === "pacote" ? Number(produto.pacotes || 0) : 0,
      unidades_avulsas: Number(produto.unidades_avulsas || 0),
      total_unidades: calcularTotal(produto),
    }));

    await supabase.from("inventario_itens").insert(itens);

    for (const produto of produtos) {
      await supabase
        .from("produtos")
        .update({
          quantidade: calcularTotal(produto),
        })
        .eq("id", produto.id);
    }

    alert("Inventário salvo com sucesso!");
    setSalvando(false);
    buscarProdutos();
  }

  function enviarWhatsApp() {
    let texto = "📦 INVENTÁRIO\n\n";

    const categorias = ["Expedição", "Geral"];

    categorias.forEach((categoria) => {
      const itensCategoria = produtos.filter(
        (produto) => (produto.categoria || "Geral") === categoria,
      );

      if (itensCategoria.length > 0) {
        texto += `*${categoria}*\n\n`;

        itensCategoria.forEach((produto) => {
          texto += `✅ ${produto.nome}\n`;

          if (produto.tipo_contagem === "pacote") {
            texto += `Pacotes: ${produto.pacotes}\n`;
            texto += `Unidades: ${produto.unidades_avulsas}\n`;
            texto += `Total: ${calcularTotal(produto)} unidades\n\n`;
          } else {
            texto += `Unidades: ${calcularTotal(produto)}\n\n`;
          }
        });
      }
    });

    window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank");
  }

  const filtrados = produtos.filter((produto) => {
    const nomeCombina = produto.nome
      .toLowerCase()
      .includes(busca.toLowerCase());

    const categoriaCombina =
      categoriaFiltro === "Todos" ||
      (produto.categoria || "Geral") === categoriaFiltro;

    return nomeCombina && categoriaCombina;
  });

  const totalItens = filtrados.reduce(
    (soma, produto) => soma + calcularTotal(produto),
    0,
  );

  const produtosContados = produtos.filter((produto) => produto.contado).length;

  const progresso =
    produtos.length > 0
      ? Math.round((produtosContados / produtos.length) * 100)
      : 0;

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
        <div className="bg-white rounded-xl p-3 flex gap-2 shadow mb-3">
          <Search />

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="outline-none w-full bg-transparent"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {["Todos", "Expedição", "Geral"].map((categoria) => (
            <button
              key={categoria}
              onClick={() => setCategoriaFiltro(categoria)}
              className={`p-3 rounded-xl font-bold text-sm ${
                categoriaFiltro === categoria
                  ? "bg-[#102d5c] text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              {categoria}
            </button>
          ))}
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
                    {produto.categoria || "Geral"} •{" "}
                    {produto.contado ? "Conferido" : "Aguardando contagem"}
                  </p>

                  {produto.tipo_contagem === "pacote" && (
                    <p className="text-xs text-blue-700 mt-1">
                      1 pacote = {produto.unidades_por_pacote} unidades
                    </p>
                  )}
                </div>
              </div>

              {produto.tipo_contagem === "pacote" ? (
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-sm font-bold text-gray-600 mb-2">
                      📦 Pacotes
                    </p>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => alterarCampo(produto.id, "pacotes", -1)}
                        className="bg-white rounded-full p-3 shadow-sm"
                      >
                        <Minus />
                      </button>

                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={produto.pacotes}
                          onChange={(e) =>
                            digitarCampo(produto.id, "pacotes", e.target.value)
                          }
                          placeholder="0"
                          className="w-32 text-center text-3xl font-bold border rounded-xl p-2 pr-4"
                        />

                        <span className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-500">
                          pacote(s)
                        </span>
                      </div>

                      <button
                        onClick={() => alterarCampo(produto.id, "pacotes", 1)}
                        className="bg-white rounded-full p-3 shadow-sm"
                      >
                        <Plus />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mt-6">
                    <p className="text-sm font-bold text-gray-600 mb-2">
                      📄 Unidades
                    </p>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() =>
                          alterarCampo(produto.id, "unidades_avulsas", -1)
                        }
                        className="bg-white rounded-full p-3 shadow-sm"
                      >
                        <Minus />
                      </button>

                      <div className="relative">
                        <input
                          type="number"
                          inputMode="numeric"
                          value={produto.unidades_avulsas}
                          onChange={(e) =>
                            digitarCampo(
                              produto.id,
                              "unidades_avulsas",
                              e.target.value,
                            )
                          }
                          placeholder="0"
                          className="w-32 text-center text-3xl font-bold border rounded-xl p-2 pr-4"
                        />

                        <span className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-500">
                          unidade(s)
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          alterarCampo(produto.id, "unidades_avulsas", 1)
                        }
                        className="bg-white rounded-full p-3 shadow-sm"
                      >
                        <Plus />
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-3 text-center mt-6">
                    <p className="text-sm text-blue-700">Total calculado</p>

                    <strong className="text-3xl text-blue-900">
                      {calcularTotal(produto)}
                    </strong>

                    <p className="text-xs text-blue-700">unidades</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-3 mt-4">
                  <p className="text-sm font-bold text-gray-600 mb-2">
                    📄 Unidades
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        alterarCampo(produto.id, "unidades_avulsas", -1)
                      }
                      className="bg-white rounded-full p-3 shadow-sm"
                    >
                      <Minus />
                    </button>

                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={produto.unidades_avulsas}
                        onChange={(e) =>
                          digitarCampo(
                            produto.id,
                            "unidades_avulsas",
                            e.target.value,
                          )
                        }
                        placeholder="0"
                        className="w-32 text-center text-3xl font-bold border rounded-xl p-2 pr-4"
                      />

                      <span className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-500">
                        unidade(s)
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        alterarCampo(produto.id, "unidades_avulsas", 1)
                      }
                      className="bg-white rounded-full p-3 shadow-sm"
                    >
                      <Plus />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow mt-5">
          <p className="text-gray-500">Total de itens filtrados</p>
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
