import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Camera, Image } from "lucide-react";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editando, setEditando] = useState(null);

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [categoria, setCategoria] = useState("Geral");
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
      alert(error.message);
      return;
    }

    setProdutos(data || []);
  }

  useEffect(() => {
    buscarProdutos();
  }, []);

  function selecionarFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivo(file);
    setPreview(URL.createObjectURL(file));
  }

  async function enviarFoto() {
    if (!arquivo) return foto || "";

    const extensao = arquivo.name.split(".").pop();
    const nomeArquivo = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extensao}`;

    const { error } = await supabase.storage
      .from("produtos")
      .upload(nomeArquivo, arquivo, {
        upsert: false,
        contentType: arquivo.type,
      });

    if (error) {
      alert("Erro no upload da imagem");
      return "";
    }

    const url = supabase.storage.from("produtos").getPublicUrl(nomeArquivo);
    return url.data.publicUrl;
  }

  function limparForm() {
    setNome("");
    setQuantidade("");
    setCategoria("Geral");
    setFoto("");
    setArquivo(null);
    setPreview("");
    setEditando(null);
    setAbrirForm(false);
    setSalvando(false);
  }

  function abrirNovoProduto() {
    limparForm();
    setAbrirForm(true);
  }

  function editarProduto(produto) {
    setEditando(produto);
    setNome(produto.nome || "");
    setQuantidade(String(produto.quantidade ?? 0));
    setCategoria(produto.categoria || "Geral");
    setFoto(produto.foto || "");
    setPreview(produto.foto || "");
    setArquivo(null);
    setAbrirForm(true);
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

    const produtoPayload = {
      nome: nome.trim(),
      quantidade: Number(quantidade || 0),
      categoria,
      foto: fotoFinal || foto || "",
    };

    if (editando?.id) {
      const { data, error } = await supabase
        .from("produtos")
        .update(produtoPayload)
        .eq("id", editando.id)
        .select("*")
        .single();

      if (error) {
        alert(error.message);
        setSalvando(false);
        return;
      }

      setProdutos((lista) =>
        lista.map((produto) => (produto.id === data.id ? data : produto)),
      );
    } else {
      const { data, error } = await supabase
        .from("produtos")
        .insert(produtoPayload)
        .select("*")
        .single();

      if (error) {
        alert(error.message);
        setSalvando(false);
        return;
      }

      setProdutos((lista) => [data, ...lista]);
    }

    limparForm();
  }

  async function excluirProduto(id) {
    const confirmar = confirm("Deseja excluir esse produto?");
    if (!confirmar) return;

    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setProdutos((lista) => lista.filter((produto) => produto.id !== id));
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

        <div className="mt-5 space-y-4">
          {produtos.map((produto) => (
            <div key={produto.id} className="bg-white rounded-2xl p-4 shadow">
              <img
                src={produto.foto || "https://via.placeholder.com/200"}
                alt={produto.nome}
                className="w-full h-40 object-cover rounded-xl bg-gray-100"
              />

              <h2 className="font-bold mt-3">{produto.nome}</h2>
              <p className="text-sm text-gray-500">
                {produto.categoria || "Geral"}
              </p>
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

      {abrirForm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-4 max-h-[95vh] overflow-y-auto space-y-3 pb-8">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">
                {editando ? "Editar Produto" : "Novo Produto"}
              </h2>

              <button onClick={limparForm}>
                <X />
              </button>
            </div>

            {preview && (
              <img
                src={preview}
                alt="Prévia do produto"
                className="w-full h-48 object-cover rounded-xl bg-gray-100"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="border p-4 rounded-xl flex gap-2 items-center justify-center cursor-pointer">
                <Camera size={20} />
                Câmera
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={selecionarFoto}
                />
              </label>

              <label className="border p-4 rounded-xl flex gap-2 items-center justify-center cursor-pointer">
                <Image size={20} />
                Galeria
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={selecionarFoto}
                />
              </label>
            </div>

            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="border p-3 rounded-xl w-full"
            />

            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="border p-3 rounded-xl w-full bg-white font-bold"
            >
              <option value="Geral">Categoria: Geral</option>
              <option value="Expedição">Categoria: Expedição</option>
            </select>

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
        </div>
      )}

      <BottomMenu />
    </div>
  );
}
