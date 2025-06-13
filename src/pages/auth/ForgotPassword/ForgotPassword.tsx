import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, House, AlertCircle } from 'lucide-react';
import { ButtonHomeBack } from "@/components/ButtonHomeBack";
import AuthService from "../../../api/authService";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { uidb64, token } = useParams(); // Para reset de senha
  const [step, setStep] = useState(uidb64 && token ? 2 : 1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Por favor, informe seu e-mail");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await AuthService.requestPasswordReset({ email });
      setSuccess("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setTimeout(() => {
        if (!uidb64 && !token) {
          navigate('/login');
        }
      }, 3000);
    } catch (error: any) {
      if (error.response && error.response.data) {
        if (error.response.data.email) {
          setError(error.response.data.email.join(", "));
        } else if (error.response.data.detail) {
          setError(error.response.data.detail);
        } else {
          setError("Falha ao solicitar recuperação de senha.");
        }
      } else {
        setError("Erro de conexão. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await AuthService.confirmPasswordReset({
        password,
        password2: confirmPassword,
        token: token || "",
        uidb64: uidb64 || ""
      });

      setSuccess("Senha alterada com sucesso!");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'object') {
          const errorMessages = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
            .join("; ");
          setError(errorMessages);
        } else {
          setError("Falha ao redefinir senha. Verifique o link ou tente novamente.");
        }
      } else {
        setError("Erro de conexão. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderEmailScreen = () => (
    <Card className="w-[700px] h-auto rounded-[18px] border-2 border-solid border-black bg-white">
      <CardHeader className="pb-0">
        <CardTitle className="text-[35px] text-center [font-family:'Silkscreen',Helvetica] font-bold">
          ESQUECI A SENHA
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 px-[45px]">
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="text-red-500 flex items-center gap-2 mb-4">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-2" onSubmit={handleEmailSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px]"
            >
              CONFIRME O EMAIL
            </label>
            <Input
              id="email"
              type="email"
              placeholder="teste@email.com"
              className="h-[55px] rounded-xl border border-solid border-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-[274px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105"
            >
              {loading ? "ENVIANDO..." : "ENVIAR"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderNewPasswordScreen = () => (
    <Card className="w-[700px] h-auto rounded-[18px] border-2 border-solid border-black bg-white">
      <CardHeader className="pb-0">
        <CardTitle className="text-[35px] text-center [font-family:'Silkscreen',Helvetica] font-bold">
          NOVA SENHA
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-1 px-[45px]">
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {success}
          </div>
        )}

        {error && (
          <div className="text-red-500 flex items-center gap-2 mb-4">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-2" onSubmit={handlePasswordReset}>
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px]"
            >
              NOVA SENHA
            </label>
            <Input
              id="newPassword"
              type="password"
              className="h-[55px] rounded-xl border border-solid border-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px]"
            >
              CONFIRME A SENHA
            </label>
            <Input
              id="confirmPassword"
              type="password"
              className="h-[55px] rounded-xl border border-solid border-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-[274px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[32px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105"
            >
              {loading ? "ENVIANDO..." : "ALTERAR"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden">
        {/* Imagens de decoração */}
        <img
          className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right"
          alt="Cloud decoration"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110"
          alt="Cloud decoration"
          src="/nuvemright.png"
        />

        {/* Botões de navegação */}
        <div className="flex gap-5 absolute top-14 left-[33px]">
          <ButtonHomeBack onClick={() => navigate("/login")}><ArrowLeft /></ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/")}><House /></ButtonHomeBack>
        </div>

        {/* Conteúdo principal */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {step === 1 ? renderEmailScreen() : renderNewPasswordScreen()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;