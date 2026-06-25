import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Package, X, Camera } from "lucide-react";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);

  const [abrirForm, setAbrirForm] = useState(false);

  const [editando, setEditando] = useState(null);

  const [nome, setNome] = useState("");

  const [quantidade, setQuantidade] = useState("");

  const [foto, setFoto] = useState("");

  const [arquivo, setArquivo] = useState(null);

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

  async function enviarFoto() {
    if (!arquivo) {
      return foto;
    }

    const nomeArquivo = Date.now() + "-" + arquivo.name;

    const { error } = await supabase.storage

      .from("produtos")

      .upload(
        nomeArquivo,

        arquivo,
      );

    if (error) {
      alert(error.message);

      return null;
    }

    const url = supabase.storage

      .from("produtos")

      .getPublicUrl(nomeArquivo).data.publicUrl;

    return url;
  }

  async function salvarProduto() {
    const fotoFinal = await enviarFoto();

    if (editando) {
      await supabase

        .from("produtos")

        .update({
          nome,

          quantidade: Number(quantidade),

          foto: fotoFinal || foto,
        })

        .eq("id", editando.id);
    } else {
      await supabase

        .from("produtos")

        .insert([
          {
            nome,

            quantidade: Number(quantidade),

            foto: fotoFinal,
          },
        ]);
    }

    setNome("");

    setQuantidade("");

    setFoto("");

    setArquivo(null);

    setEditando(null);

    setAbrirForm(false);

    buscarProdutos();
  }

  function editar(produto) {
    setEditando(produto);

    setNome(produto.nome);

    setQuantidade(produto.quantidade);

    setFoto(produto.foto || "");

    setAbrirForm(true);
  }

  async function excluirProduto(id) {
    await supabase

      .from("produtos")

      .delete()

      .eq("id", id);

    buscarProdutos();
  }

  return (
    <div className="min-h-screen pb-28">
      <header
        className="
bg-[#102d5c]
text-white
p-5
"
      >
        <h1 className="text-xl font-bold">Produtos</h1>
      </header>

      <main className="p-4">
        <button
          onClick={() => setAbrirForm(true)}
          className="
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
          <Plus />
          Novo Produto
        </button>

        {abrirForm && (
          <div
            className="
bg-white
mt-5
p-4
rounded-xl
shadow
space-y-3
"
          >
            <div className="flex justify-between">
              <h2 className="font-bold">Produto</h2>

              <X
                onClick={() => setAbrirForm(false)}
                className="cursor-pointer"
              />
            </div>

            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="
border
p-3
rounded-xl
w-full
"
            />

            <input
              type="number"
              placeholder="Quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="
border
p-3
rounded-xl
w-full
"
            />

            <label
              className="
border
p-4
rounded-xl
flex
gap-2
items-center
cursor-pointer
"
            >
              <Camera />
              Adicionar foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={(e) => setArquivo(e.target.files[0])}
              />
            </label>

            <button
              onClick={salvarProduto}
              className="
bg-green-600
text-white
w-full
p-3
rounded-xl
"
            >
              Salvar
            </button>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="
bg-white
rounded-2xl
p-4
shadow
"
            >
              <img
                src={produto.foto || "https://via.placeholder.com/200"}
                className="
w-full
h-40
object-cover
rounded-xl
"
              />

              <h2 className="font-bold mt-3">{produto.nome}</h2>

              <p>Qtd: {produto.quantidade}</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => editar(produto)}
                  className="flex-1 bg-gray-100 p-3 rounded-xl"
                >
                  <Pencil />
                  Editar
                </button>

                <button
                  onClick={() => excluirProduto(produto.id)}
                  className="
flex-1
bg-red-50
text-red-500
p-3
rounded-xl
"
                >
                  <Trash2 />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomMenu />
    </div>
  );
}
