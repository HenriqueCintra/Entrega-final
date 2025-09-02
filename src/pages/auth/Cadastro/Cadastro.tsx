import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ButtonHomeBack } from "@/components/ButtonHomeBack";
import AuthService from "../../../api/authService";

export const Cadastro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    username: "",
    email: "",
    data_nascimento: "",
    password: "",
    password_confirm: "",
    nickname: "", // Será preenchido automaticamente com o valor do username
    last_name: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.first_name || !formData.username || !formData.email || !formData.password || !formData.password_confirm) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError("As senhas não conferem");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Envia nickname igual ao username para satisfazer o backend
      const dataToSend = {
        ...formData,
        nickname: formData.username
      };

      await AuthService.register(dataToSend);
      setSuccess("Cadastro realizado com sucesso! Redirecionando para o login...");

      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      if (error.response && error.response.data) {
        // Trata erros da API
        if (typeof error.response.data === 'object') {
          // Extrai mensagens de erro
          const errorMessages = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("; ");
          setError(errorMessages);
        } else {
          setError("Falha ao realizar cadastro. Verifique os dados.");
        }
      } else {
        setError("Erro de conexão. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 6 inputs na ordem solicitada: nome, usuário, email, data nascimento, senha, confirmar senha
  const formFields = [
    { id: "first_name", label: "NOME", type: "text" },
    { id: "username", label: "USUÁRIO", type: "text" },
    { id: "email", label: "EMAIL", type: "email" },
    { id: "data_nascimento", label: "DATA DE NASCIMENTO", type: "date" },
    { id: "password", label: "SENHA", type: "password" },
    { id: "password_confirm", label: "CONFIRMAR SENHA", type: "password" },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden">
        {/* Nuvens com animação */}
        <img
          className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right opacity-75 scale-110"
          alt="Nuvem"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110"
          alt="Nuvem"
          src="/nuvemright.png"
        />

        {/* Botão de navegação */}
        <div className="absolute top-14 left-[33px]">
          <ButtonHomeBack onClick={() => navigate("/")}><ArrowLeft /></ButtonHomeBack>
        </div>

        {/* Card de Cadastro */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Card className="w-[700px] rounded-[18px] border-2 border-solid border-black bg-white">
            <CardContent className="pt-8 px-[45px]">
              <h1 className="text-center text-[32px] [font-family:'Silkscreen',Helvetica] font-bold mb-8">
                CADASTRO
              </h1>

              {/* Mensagem de sucesso */}
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                  {success}
                </div>
              )}

              {/* Mensagem de erro */}
              {error && (
                <div className="text-red-500 flex items-center gap-2 mb-4">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6">
                  {formFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[18px]">
                        {field.label}
                      </label>
                      <input
                        id={field.id}
                        type={field.type}
                        className="w-full h-[55px] rounded-xl border-2 border-solid border-black bg-white p-3 text-black [font-family:'Silkscreen',Helvetica]"
                        value={formData[field.id as keyof typeof formData]}
                        onChange={handleChange}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col justify-between items-center pt-8">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-[374px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[24px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105"
                  >
                    {loading ? "PROCESSANDO..." : "CADASTRAR"}
                  </Button>

                  <a
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                    className="[font-family:'Silkscreen',Helvetica] font-normal mt-4 text-[#167dd2] text-base underline"
                  >
                    Já possui uma conta? Faça login
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};