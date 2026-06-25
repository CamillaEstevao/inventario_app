import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Camera } from "lucide-react";
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
  const [salvando, setSalvando] = useState(false);

  async function buscarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    setProdutos(data || []);
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

    const { error: uploadError } = await supabase.storage
      .from("produtos")
      .upload(nomeArquivo, arquivo, {
        upsert: false,
      });

    if (uploadError) {
      console.log(uploadError);
      alert("Erro no upload da imagem");
      return "";
    }

    const url = supabase.storage.from("produtos").getPublicUrl(nomeArquivo);

    return url.data.publicUrl;
  }

  async function salvarProduto() {
    if (!nome.trim()) {
      alert("Digite o nome");
      return;
    }

    setSalvando(true);

    const fotoFinal = await enviarFoto();

    if (arquivo && !fotoFinal) {
      setSalvando(false);
      return;
    }

    if (editando) {
      const { error } = await supabase
        .from("produtos")
        .update({
          nome: nome.trim(),
          quantidade: Number(quantidade || 0),
          foto: fotoFinal || foto,
        })
        .eq("id", editando.id);

      if (error) {
        console.log(error);
        alert(error.message);
        setSalvando(false);
        return;
      }
    } else {
      const { error } = await supabase.from("produtos").insert({
        nome: nome.trim(),
        quantidade: Number(quantidade || 0),
        foto: fotoFinal,
      });

      if (error) {
        console.log(error);
        alert(error.message);
        setSalvando(false);
        return;
      }
    }

    limparForm();

    await buscarProdutos();

    setSalvando(false);
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

  function abrirNovoProduto() {
    limparForm();
    setAbrirForm(true);
  }

  function editarProduto(produto) {
    setEditando(produto);
    setNome(produto.nome || "");
    setQuantidade(produto.quantidade || 0);
    setFoto(produto.foto || "");
    setPreview(produto.foto || "");
    setArquivo(null);
    setAbrirForm(true);
  }

  async function excluirProduto(id) {
    const confirmar = confirm("Deseja excluir esse produto?");

    if (!confirmar) return;

    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (error) {
      console.log(error);
      alert(error.message);
      return;
    }

    await buscarProdutos();
  }

  return (
    <div className="min-h-screen pb-28 bg-gray-100">
      <header className="bg-[#102d5c] text-white p-5">
        <h1 className="text-xl font-bold">Produtos</h1>
        <p className="text-sm opacity-80">Cadastro e edição de produtos</p>
      </header>

      <main className="p-4">
        <button
          onClick={abrirNovoProduto}
          className="w-full bg-[#102d5c] text-white p-4 rounded-xl flex justify-center gap-2 font-bold"
        >
          <Plus />
          Novo Produto
        </button>

        {abrirForm && (
          <div className="bg-white p-4 rounded-xl mt-5 shadow space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bold">
                {editando ? "Editar Produto" : "Cadastro"}
              </h2>

              <button onClick={limparForm}>
                <X />
              </button>
            </div>

            {preview && (
              <img
                src={preview}
                alt="Prévia do produto"
                className="w-full h-48 object-cover rounded-xl"
              />
            )}

            <label className="border p-4 rounded-xl flex gap-2 items-center cursor-pointer">
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
              className="border p-3 rounded-xl w-full"
            />

            <input
              type="number"
              placeholder="Quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              className="border p-3 rounded-xl w-full"
            />

            <button
              onClick={salvarProduto}
              disabled={salvando}
              className="bg-green-600 text-white p-3 rounded-xl w-full font-bold disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        )}

        <div className="mt-5 space-y-4">
          {produtos.map((produto) => (
            <div key={produto.id} className="bg-white rounded-2xl p-4 shadow">
              <img
                src={produto.foto || "https://via.placeholder.com/200"}
                alt={produto.nome}
                className="w-full h-40 object-cover rounded-xl bg-gray-100"
              />

              <h2 className="font-bold mt-3">{produto.nome}</h2>

              <p>Qtd: {produto.quantidade}</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => editarProduto(produto)}
                  className="flex-1 bg-gray-100 p-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Pencil size={18} />
                  Editar
                </button>

                <button
                  onClick={() => excluirProduto(produto.id)}
                  className="flex-1 bg-red-50 text-red-500 p-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
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
