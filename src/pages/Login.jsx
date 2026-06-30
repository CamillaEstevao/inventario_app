import { useState } from "react";
import { Lock, Mail, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();

    if (!email || !senha) {
      alert("Preencha e-mail e senha");
      return;
    }

    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("E-mail ou senha inválidos");
      setCarregando(false);
      return;
    }

    setCarregando(false);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[#102d5c] flex items-center justify-center p-5">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl">
        <div className="text-center mb-8">
          <div className="bg-[#102d5c] text-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={40} />
          </div>

          <h1 className="text-2xl font-bold text-[#102d5c]">Inventário NX</h1>

          <p className="text-gray-500">Controle inteligente de estoque</p>
        </div>

        <form onSubmit={entrar} className="space-y-4">
          <div className="border rounded-xl p-3 flex items-center gap-3">
            <Mail className="text-gray-400" />

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="outline-none w-full"
            />
          </div>

          <div className="border rounded-xl p-3 flex items-center gap-3">
            <Lock className="text-gray-400" />

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="outline-none w-full"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#102d5c] text-white p-4 rounded-xl font-bold disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by NexCode Studio
        </p>
      </div>
    </div>
  );
}
