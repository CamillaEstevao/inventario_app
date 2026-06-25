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

  const [preview, setPreview] = useState("");

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

  function selecionarFoto(e) {
    const file = e.target.files[0];

    if (!file) return;

    setArquivo(file);

    setPreview(URL.createObjectURL(file));
  }

  async function enviarFoto() {
    if (!arquivo) {
      return foto || "";
    }

    const nomeArquivo = `${Date.now()}-${arquivo.name}`;

    const upload = await supabase.storage
      .from("produtos")
      .upload(nomeArquivo, arquivo, {
        upsert: false,
      });

    if (upload.error) {
      console.log(upload.error);

      alert("Erro enviando imagem");

      return "";
    }

    const { data } = supabase.storage
      .from("produtos")
      .getPublicUrl(nomeArquivo);

    return data.publicUrl;
  }

  async function salvarProduto() {
    if (!nome) {
      alert("Digite o nome");

      return;
    }

    let fotoFinal = foto;

    if (arquivo) {
      const nomeArquivo = `${Date.now()}-${arquivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("produtos")
        .upload(nomeArquivo, arquivo);

      if (uploadError) {
        console.log(uploadError);

        alert("Erro no upload");

        return;
      }

      const url = supabase.storage.from("produtos").getPublicUrl(nomeArquivo);

      fotoFinal = url.data.publicUrl;

      console.log("IMAGEM:", fotoFinal);
    }

    if (editando) {
      await supabase

        .from("produtos")

        .update({
          nome,

          quantidade: Number(quantidade),

          foto: fotoFinal,
        })

        .eq("id", editando.id);
    } else {
      await supabase

        .from("produtos")

        .insert({
          nome,

          quantidade: Number(quantidade),

          foto: fotoFinal,
        });
    }

    limparForm();

    buscarProdutos();
  }

  function limparForm() {
    setNome("");

    setQuantidade("");

    setFoto("");

    setArquivo(null);

    setPreview("");

    setEditando(null);

    setAbrirForm(false);
  }

  function editarProduto(produto) {
    setEditando(produto);

    setNome(produto.nome);

    setQuantidade(produto.quantidade);

    setFoto(produto.foto || "");

    setPreview(produto.foto || "");

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
flex
justify-center
gap-2
font-bold
"
        >
          <Plus />
          Novo Produto
        </button>

        {abrirForm && (
          <div
            className="
bg-white
p-4
rounded-xl
mt-5
shadow
space-y-3
"
          >
            <div className="flex justify-between">
              <h2 className="font-bold">Cadastro</h2>

              <X onClick={limparForm} />
            </div>

            {preview && (
              <img
                src={preview}
                className="
w-full
h-48
object-cover
rounded-xl
"
              />
            )}

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
              Tirar foto
              <input
                type="file"
                accept="image/*"
                capture="environment"
                hidden
                onChange={selecionarFoto}
              />
            </label>

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

            <button
              onClick={salvarProduto}
              className="
bg-green-600
text-white
p-3
rounded-xl
w-full
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
                  onClick={() => editarProduto(produto)}
                  className="
flex-1
bg-gray-100
p-3
rounded-xl
"
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
