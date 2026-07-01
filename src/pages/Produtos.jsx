import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Camera,
  Image,
  Search,
  Package,
  Boxes,
  AlertTriangle,
  Filter,
  ScanLine,
} from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import BottomMenu from "../components/BottomMenu";
import { supabase } from "../services/supabase";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [abrirForm, setAbrirForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [escaneando, setEscaneando] = useState(false);

  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [ordem, setOrdem] = useState("recentes");

  const [nome, setNome] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [categoria, setCategoria] = useState("Geral");
  const [tipoContagem, setTipoContagem] = useState("unidade");
  const [unidadesPorPacote, setUnidadesPorPacote] = useState(1);
  const [pacotesEstoque, setPacotesEstoque] = useState(0);
  const [unidadesAvulsasEstoque, setUnidadesAvulsasEstoque] = useState(0);

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

  useEffect(() => {
    if (!escaneando) return;

    async function iniciarScanner() {
      try {
        const leitor = new BrowserMultiFormatReader();

        scannerRef.current = await leitor.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (resultado) => {
            if (resultado) {
              const codigo = resultado.getText();
              tratarCodigoLido(codigo);
            }
          },
        );
      } catch (error) {
        console.log(error);
        alert("Não foi possível abrir a câmera.");
        setEscaneando(false);
      }
    }

    iniciarScanner();

    return () => {
      pararScanner();
    };
  }, [escaneando]);

  function pararScanner() {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }
  }

  function tratarCodigoLido(codigo) {
    pararScanner();
    setEscaneando(false);

    const produtoEncontrado = produtos.find(
      (produto) => String(produto.codigo_barras || "") === String(codigo),
    );

    if (produtoEncontrado) {
      editarProduto(produtoEncontrado);
      alert(`Produto encontrado: ${produtoEncontrado.nome}`);
      return;
    }

    const cadastrar = confirm(
      `Código não encontrado:\n${codigo}\n\nDeseja cadastrar um novo produto com esse código?`,
    );

    if (cadastrar) {
      limparForm();
      setCodigoBarras(codigo);
      setAbrirForm(true);
    }
  }

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

  function calcularTotalProduto() {
    if (tipoContagem === "pacote") {
      return (
        Number(pacotesEstoque || 0) * Number(unidadesPorPacote || 1) +
        Number(unidadesAvulsasEstoque || 0)
      );
    }

    return Number(quantidade || 0);
  }

  function calcularPacotes(produto) {
    return Math.floor(
      Number(produto.quantidade || 0) /
        Number(produto.unidades_por_pacote || 1),
    );
  }

  function calcularUnidadesAvulsas(produto) {
    return (
      Number(produto.quantidade || 0) % Number(produto.unidades_por_pacote || 1)
    );
  }

  function statusProduto(produto) {
    const qtd = Number(produto.quantidade || 0);

    if (qtd <= 3) {
      return {
        texto: "Crítico",
        corTexto: "text-red-600",
        corBolinha: "bg-red-500",
        corBarra: "bg-red-500",
      };
    }

    if (qtd <= 10) {
      return {
        texto: "Estoque baixo",
        corTexto: "text-orange-600",
        corBolinha: "bg-orange-500",
        corBarra: "bg-orange-400",
      };
    }

    return {
      texto: "Em estoque",
      corTexto: "text-green-600",
      corBolinha: "bg-green-500",
      corBarra: "bg-[#102d5c]",
    };
  }

  function limparForm() {
    setNome("");
    setCodigoBarras("");
    setQuantidade("");
    setCategoria("Geral");
    setTipoContagem("unidade");
    setUnidadesPorPacote(1);
    setPacotesEstoque(0);
    setUnidadesAvulsasEstoque(0);
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
    const total = Number(produto.quantidade || 0);
    const unidadesPacote = Number(produto.unidades_por_pacote || 1);

    setEditando(produto);
    setNome(produto.nome || "");
    setCodigoBarras(produto.codigo_barras || "");
    setQuantidade(String(total));
    setCategoria(produto.categoria || "Geral");
    setTipoContagem(produto.tipo_contagem || "unidade");
    setUnidadesPorPacote(unidadesPacote);

    if (produto.tipo_contagem === "pacote") {
      setPacotesEstoque(Math.floor(total / unidadesPacote));
      setUnidadesAvulsasEstoque(total % unidadesPacote);
    } else {
      setPacotesEstoque(0);
      setUnidadesAvulsasEstoque(0);
    }

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

    const quantidadeFinal = calcularTotalProduto();

    const produtoPayload = {
      nome: nome.trim(),
      codigo_barras: codigoBarras.trim() || null,
      quantidade: quantidadeFinal,
      categoria,
      tipo_contagem: tipoContagem,
      unidades_por_pacote:
        tipoContagem === "pacote" ? Number(unidadesPorPacote || 1) : 1,
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

  const totalProdutos = produtos.length;

  const totalItens = produtos.reduce(
    (total, produto) => total + Number(produto.quantidade || 0),
    0,
  );

  const estoqueBaixo = produtos.filter(
    (produto) => Number(produto.quantidade || 0) <= 10,
  ).length;

  const criticos = produtos.filter(
    (produto) => Number(produto.quantidade || 0) <= 3,
  ).length;

  const categorias = ["Todos", "Expedição", "Geral"];

  const produtosFiltrados = produtos
    .filter((produto) => {
      const buscaTexto = busca.toLowerCase();

      const nomeCombina = produto.nome.toLowerCase().includes(buscaTexto);

      const codigoCombina = String(produto.codigo_barras || "")
        .toLowerCase()
        .includes(buscaTexto);

      const categoriaCombina =
        categoriaFiltro === "Todos" ||
        (produto.categoria || "Geral") === categoriaFiltro;

      return (nomeCombina || codigoCombina) && categoriaCombina;
    })
    .sort((a, b) => {
      if (ordem === "nome") return a.nome.localeCompare(b.nome);
      if (ordem === "menor")
        return Number(a.quantidade || 0) - Number(b.quantidade || 0);
      if (ordem === "maior")
        return Number(b.quantidade || 0) - Number(a.quantidade || 0);

      return Number(b.id || 0) - Number(a.id || 0);
    });

  const maiorQuantidade =
    produtos.length > 0
      ? Math.max(...produtos.map((produto) => Number(produto.quantidade || 0)))
      : 1;

  return (
    <div className="min-h-screen pb-28 bg-[#f5f7fb]">
      <header className="bg-[#102d5c] text-white p-5 rounded-b-3xl shadow">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 w-14 h-14 rounded-2xl flex items-center justify-center">
            <Package size={30} />
          </div>

          <div>
            <p className="text-sm opacity-80">Inventário NX</p>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-sm opacity-80">
              {totalProdutos} produtos cadastrados
            </p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div className="bg-white rounded-2xl p-3 flex gap-3 items-center shadow">
            <Search className="text-gray-400" />

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto ou código..."
              className="outline-none w-full bg-transparent"
            />
          </div>

          <button
            onClick={() => setEscaneando(true)}
            className="bg-[#102d5c] text-white rounded-2xl px-4 shadow flex items-center justify-center"
          >
            <ScanLine />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {categorias.map((item) => (
            <button
              key={item}
              onClick={() => setCategoriaFiltro(item)}
              className={`px-4 py-3 rounded-2xl font-bold text-sm whitespace-nowrap ${
                categoriaFiltro === item
                  ? "bg-[#102d5c] text-white"
                  : "bg-white text-gray-600 shadow"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-4 shadow">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <Package className="mx-auto text-blue-700" />
              <p className="text-xs text-gray-500 mt-2">Produtos</p>
              <strong>{totalProdutos}</strong>
            </div>

            <div>
              <Boxes className="mx-auto text-green-700" />
              <p className="text-xs text-gray-500 mt-2">Itens</p>
              <strong>{totalItens}</strong>
            </div>

            <div>
              <Filter className="mx-auto text-orange-500" />
              <p className="text-xs text-gray-500 mt-2">Baixo</p>
              <strong>{estoqueBaixo}</strong>
            </div>

            <div>
              <AlertTriangle className="mx-auto text-red-500" />
              <p className="text-xs text-gray-500 mt-2">Crítico</p>
              <strong>{criticos}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-700">
            {produtosFiltrados.length} resultado(s)
          </p>

          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value)}
            className="bg-white border rounded-xl p-2 text-sm font-semibold"
          >
            <option value="recentes">Mais recentes</option>
            <option value="nome">Nome A-Z</option>
            <option value="menor">Menor estoque</option>
            <option value="maior">Maior estoque</option>
          </select>
        </div>

        <div className="space-y-4">
          {produtosFiltrados.map((produto) => {
            const status = statusProduto(produto);
            const quantidadeAtual = Number(produto.quantidade || 0);
            const largura = Math.max(
              6,
              (quantidadeAtual / maiorQuantidade) * 100,
            );

            return (
              <div
                key={produto.id}
                className="bg-white rounded-3xl p-4 shadow border border-gray-100"
              >
                <div className="flex gap-4">
                  <img
                    src={produto.foto || "https://via.placeholder.com/100"}
                    alt={produto.nome}
                    className="w-24 h-24 rounded-2xl object-cover bg-gray-100"
                  />

                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg leading-tight">
                      {produto.nome}
                    </h2>

                    <p className="text-sm text-blue-700 font-semibold mt-1">
                      {produto.categoria || "Geral"}
                    </p>

                    {produto.codigo_barras && (
                      <p className="text-xs text-gray-400 mt-1">
                        Cód: {produto.codigo_barras}
                      </p>
                    )}

                    <div className="mt-3">
                      <p className="text-sm text-gray-500">Estoque</p>

                      <div className="flex items-end gap-1">
                        <strong className="text-3xl text-[#102d5c]">
                          {produto.quantidade}
                        </strong>

                        <span className="text-sm mb-1">un.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${status.corBarra}`}
                      style={{ width: `${largura}%` }}
                    />
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 mt-3 text-sm font-semibold ${status.corTexto}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${status.corBolinha}`}
                    />
                    {status.texto}
                  </div>
                </div>

                {produto.tipo_contagem === "pacote" && (
                  <div className="mt-3 rounded-2xl bg-blue-50 p-3 text-sm text-blue-800">
                    <p>
                      Equivale a: {calcularPacotes(produto)} pacote(s) +{" "}
                      {calcularUnidadesAvulsas(produto)} unidade(s)
                    </p>

                    <p>1 pacote = {produto.unidades_por_pacote} unidades</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => editarProduto(produto)}
                    className="bg-gray-50 border p-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-[#102d5c]"
                  >
                    <Pencil size={18} />
                    Editar
                  </button>

                  <button
                    onClick={() => excluirProduto(produto.id)}
                    className="bg-red-50 border border-red-100 text-red-500 p-3 rounded-2xl flex items-center justify-center gap-2 font-bold"
                  >
                    <Trash2 size={18} />
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <button
        onClick={abrirNovoProduto}
        className="fixed right-5 bottom-24 bg-[#102d5c] text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center z-50"
      >
        <Plus size={34} />
      </button>

      {escaneando && (
        <div className="fixed inset-0 bg-black/80 z-[120] flex flex-col items-center justify-center p-5">
          <div className="bg-white rounded-3xl p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-lg">Scanner de código</h2>

              <button
                onClick={() => {
                  pararScanner();
                  setEscaneando(false);
                }}
              >
                <X />
              </button>
            </div>

            <video
              ref={videoRef}
              className="w-full h-72 bg-black rounded-2xl object-cover"
              muted
              playsInline
            />

            <p className="text-center text-sm text-gray-500 mt-3">
              Aponte a câmera para o código de barras.
            </p>
          </div>
        </div>
      )}

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

            <input
              placeholder="Código de barras"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
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

            <select
              value={tipoContagem}
              onChange={(e) => setTipoContagem(e.target.value)}
              className="border p-3 rounded-xl w-full bg-white font-bold"
            >
              <option value="unidade">Contagem: Unidade simples</option>
              <option value="pacote">Contagem: Pacote com unidades</option>
            </select>

            {tipoContagem === "pacote" && (
              <>
                <input
                  type="number"
                  placeholder="Unidades por pacote. Ex: 100"
                  value={unidadesPorPacote}
                  onChange={(e) => setUnidadesPorPacote(e.target.value)}
                  className="border p-3 rounded-xl w-full"
                />

                <input
                  type="number"
                  placeholder="Pacotes fechados. Ex: 1"
                  value={pacotesEstoque}
                  onChange={(e) => setPacotesEstoque(e.target.value)}
                  className="border p-3 rounded-xl w-full"
                />

                <input
                  type="number"
                  placeholder="Unidades avulsas. Ex: 50"
                  value={unidadesAvulsasEstoque}
                  onChange={(e) => setUnidadesAvulsasEstoque(e.target.value)}
                  className="border p-3 rounded-xl w-full"
                />

                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-sm text-blue-700">Total calculado</p>
                  <strong className="text-3xl text-blue-900">
                    {calcularTotalProduto()}
                  </strong>
                  <p className="text-xs text-blue-700">unidades</p>
                </div>
              </>
            )}

            {tipoContagem === "unidade" && (
              <input
                type="number"
                placeholder="Quantidade total da semana"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="border p-3 rounded-xl w-full"
              />
            )}

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
