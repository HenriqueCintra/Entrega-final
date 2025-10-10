// src/pages/Auth/Login/Login.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { AudioControl } from "@/components/AudioControl";
import { useAuth } from "../../../contexts/AuthContext";

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const clearError = () => {
        if (error) setError("");
    };

    const handleForgotPassword = (e: React.MouseEvent) => {
        e.preventDefault();
        navigate("/forgot-password");
    };

    /**
     * Função principal de submissão do formulário de login.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Por favor, preencha todos os campos");
            return;
        }
        setLoading(true);
        setError("");

        try {
            await login(username, password);
            // Após o login bem-sucedido, navega para a seleção de jogos
            navigate("/game-selection");
        } catch (error: any) {
            console.error("Erro completo de login:", error);
            if (error.response?.status === 401) {
                setError("Usuário ou senha incorretos. Verifique suas credenciais.");
            } else if (error.response?.data?.detail) {
                setError(error.response.data.detail);
            } else if (error.request) {
                setError("Servidor não responde. Verifique sua conexão.");
            } else {
                setError("Erro inesperado. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white flex flex-row justify-center w-full">
            <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden">
                <img className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right" alt="Nuvem" src="/nuvemleft.png" />
                <img className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110" alt="Nuvem" src="/nuvemright.png" />

                <div className="absolute top-14 left-[33px]">
                    <Button onClick={() => navigate("/")} className="bg-[#e3922a] hover:bg-[#d4831f] text-black px-4 py-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-['Silkscreen'] h-12 flex items-center gap-2 transform transition-transform duration-300 hover:scale-105">
                        <ArrowLeft size={20} />
                        Voltar
                    </Button>
                </div>
                <div className="absolute top-14 right-[33px]">
                    <AudioControl />
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Card className="w-[700px] h-auto rounded-[18px] border-2 border-solid border-black bg-white">
                        <CardHeader className="pb-0">
                            <CardTitle className="text-[35px] text-center [font-family:'Silkscreen',Helvetica] font-bold">
                                LOGIN
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-1 px-[45px]">
                            <form className="space-y-2" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label htmlFor="username" className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[25px]">
                                        Usuário
                                    </label>
                                    <Input id="username" type="text" className="h-[55px] rounded-xl border border-solid border-black [font-family:'Silkscreen',Helvetica] text-[20px]" value={username} onChange={(e) => { setUsername(e.target.value); clearError(); }} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block [font-family:'Silkscreen',Helvetica] font-bold text-black text-[25px]">
                                        Senha
                                    </label>
                                    <Input id="password" type="password" className="h-[55px] rounded-xl border border-solid border-black [font-family:'Silkscreen',Helvetica] text-[20px]" value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} />
                                </div>
                                {error && (
                                    <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 my-3">
                                        <AlertCircle size={20} className="flex-shrink-0" />
                                        <span className="font-medium">{error}</span>
                                    </div>
                                )}
                                <div className="flex justify-end">
                                    <a href="#" onClick={handleForgotPassword} className="[font-family:'Silkscreen',Helvetica] font-normal text-[#167dd2] underline text-[20px]">
                                        Esqueci a senha
                                    </a>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Button type="button" onClick={() => navigate("/cadastro")} className="w-[274px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[25px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105">
                                        Cadastro
                                    </Button>
                                    <Button type="submit" disabled={loading} className="w-[274px] h-[53px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[25px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105">
                                        {loading ? "Verificando..." : "Login"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};