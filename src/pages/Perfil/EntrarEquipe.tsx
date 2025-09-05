import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import {
  ArrowLeft,
  Users,
  Lock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { TeamService } from "../../api/teamService";
import { useAuth } from "../../contexts/AuthContext";

export const EntrarEquipePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const [teamCode, setTeamCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleNavigateBack = () => {
    navigate(-1);
  };

  const joinTeamMutation = useMutation({
    mutationFn: (code: string) => TeamService.joinTeam(code),
    onSuccess: async (data) => {
      // Atualizar dados do usuário
      await refreshUser();
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teamDetails'] });
      
      // Mostrar mensagem de sucesso
      const message = data?.detail || "Você entrou na equipe com sucesso!";
      setSuccessMessage(message);
      setErrorMessage("");
      
      // Aguardar um pouco para mostrar a mensagem e depois navegar
      setTimeout(() => {
        navigate("/game-selection");
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.codigo?.[0] ||
        error.response?.data?.message ||
        "Erro ao entrar na equipe. Verifique o código e tente novamente.";
      
      setErrorMessage(errorMessage);
      setSuccessMessage("");
    },
  });

  const handleJoinTeam = () => {
    // Limpar mensagens anteriores
    setErrorMessage("");
    setSuccessMessage("");

    // Validar código
    if (!teamCode.trim()) {
      setErrorMessage("Por favor, digite o código da equipe.");
      return;
    }

    // Validar tamanho mínimo do código
    if (teamCode.trim().length < 3) {
      setErrorMessage("O código deve ter pelo menos 3 caracteres.");
      return;
    }

    joinTeamMutation.mutate(teamCode.trim());
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setTeamCode(value);
    
    // Limpar mensagens quando o usuário começar a digitar
    if (errorMessage || successMessage) {
      setErrorMessage("");
      setSuccessMessage("");
    }
  };

  // Função para lidar com Enter no input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !joinTeamMutation.isPending) {
      handleJoinTeam();
    }
  };

  const silkscreenFont = "[font-family:'Silkscreen',Helvetica]";
  const inputStyle = `bg-white border-2 border-black rounded-md p-3 w-full ${silkscreenFont} text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-wider`;
  const labelStyle = `text-xs ${silkscreenFont} mb-2 block text-black font-bold`;
  const buttonBaseStyle = `${silkscreenFont} border-2 border-black rounded-md px-6 py-3 text-sm font-bold flex items-center justify-center transition-all`;

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className={`w-full min-h-screen [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden ${silkscreenFont}`}>
        {/* Nuvens decorativas */}
        <img
          className="w-[375px] h-[147px] absolute top-[80px] left-[calc(50%_-_650px)] object-cover animate-float-right opacity-80"
          alt="Cloud decoration left"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[calc(50%_-_700px)] object-cover animate-float-left opacity-75 scale-110"
          alt="Cloud decoration right"
          src="/nuvemright.png"
        />

        {/* Botão de voltar */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            onClick={handleNavigateBack} 
            variant="outline" 
            className="p-2 bg-white border-2 border-black rounded-md hover:bg-gray-200"
          >
            <ArrowLeft size={24} className="text-black" />
          </Button>
        </div>

        {/* Conteúdo principal */}
        <div className="max-w-md mx-auto pt-16 pb-8 px-4 relative z-10">
          <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-4">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="mb-3">
                  <Users size={40} className="text-[#E3922A] mx-auto mb-2" />
                </div>
                <h1 className={`${silkscreenFont} text-lg font-bold text-[#E3922A] border-2 border-black bg-gray-100 py-1 px-3 rounded-md inline-block`}>
                  ENTRAR NA EQUIPE
                </h1>
              </div>

              {/* Instruções */}
              <div className="mb-4">
                <div className="bg-blue-50 border-2 border-blue-300 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <Lock size={14} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className={`${silkscreenFont} text-xs font-bold text-blue-800 mb-1`}>
                        COMO ENTRAR:
                      </p>
                      <ul className="space-y-0.5">
                        <li className={`${silkscreenFont} text-xs text-blue-700`}>
                          • PEÇA O CÓDIGO PARA O LÍDER
                        </li>
                        <li className={`${silkscreenFont} text-xs text-blue-700`}>
                          • DIGITE O CÓDIGO ABAIXO
                        </li>
                        <li className={`${silkscreenFont} text-xs text-blue-700`}>
                          • PRESSIONE ENTER OU CLIQUE EM ENTRAR
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="teamCode" className={labelStyle}>
                    CÓDIGO DA EQUIPE
                  </label>
                  <input
                    type="text"
                    name="teamCode"
                    id="teamCode"
                    value={teamCode}
                    onChange={handleCodeChange}
                    onKeyPress={handleKeyPress}
                    placeholder="DIGITE O CÓDIGO AQUI"
                    className={inputStyle}
                    disabled={joinTeamMutation.isPending}
                    maxLength={20}
                    autoFocus
                  />
                </div>

                {/* Mensagem de erro */}
                {errorMessage && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-md p-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-red-600 mt-0.5" />
                      <p className={`${silkscreenFont} text-xs text-red-700`}>
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mensagem de sucesso */}
                {successMessage && (
                  <div className="bg-green-50 border-2 border-green-300 rounded-md p-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-600 mt-0.5" />
                      <div>
                        <p className={`${silkscreenFont} text-xs text-green-700 mb-1`}>
                          {successMessage}
                        </p>
                        <p className={`${silkscreenFont} text-xs text-green-600`}>
                          Redirecionando para seleção de jogos...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão de entrar */}
                <div className="pt-1">
                  <Button
                    onClick={handleJoinTeam}
                    disabled={!teamCode.trim() || joinTeamMutation.isPending}
                    className={`${buttonBaseStyle} w-full bg-[#29D8FF] hover:bg-[#20B4D2] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {joinTeamMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                        ENTRANDO...
                      </>
                    ) : (
                      <>
                        <Users size={16} className="mr-2" />
                        ENTRAR NA EQUIPE
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Seção de criar equipe */}
              <div className="mt-4 pt-3 border-t-2 border-gray-200">
                <div className="bg-yellow-50 border border-yellow-300 rounded-md p-2">
                  <p className={`${silkscreenFont} text-xs text-yellow-800 text-center mb-2`}>
                    💡 AINDA NÃO TEM EQUIPE?
                  </p>
                  <Button
                    onClick={() => navigate("/create-team")}
                    disabled={joinTeamMutation.isPending}
                    className={`${buttonBaseStyle} w-full bg-green-500 hover:bg-green-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50`}
                  >
                    CRIAR NOVA EQUIPE
                  </Button>
                </div>
              </div>

              {/* Link para voltar à escolha de equipe */}
              <div className="mt-3 text-center">
                <button
                  onClick={() => navigate("/choose-team")}
                  disabled={joinTeamMutation.isPending}
                  className={`${silkscreenFont} text-xs text-blue-600 hover:text-blue-800 underline disabled:opacity-50`}
                >
                  ← VOLTAR PARA ESCOLHA DE EQUIPE
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EntrarEquipePage;