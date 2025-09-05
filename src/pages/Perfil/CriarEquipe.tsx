import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ArrowLeft, Settings, Crown, UserPlus } from 'lucide-react';
import { TeamService } from "../../api/teamService";
import { useAuth } from "../../contexts/AuthContext";

export const CriarEquipePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, refreshUser } = useAuth();

  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");

  const handleNavigateBack = () => {
    navigate("/choose-team");
  };

  const createTeamMutation = useMutation({
    mutationFn: (data: { nome: string; descricao?: string }) =>
      TeamService.createTeam(data),
    onSuccess: async (novaEquipe) => {
      alert(`Equipe "${novaEquipe.nome}" criada com sucesso!`);
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      navigate("/game-selection");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.nome?.[0] ||
        "Erro ao criar equipe.";
      alert(`Erro: ${errorMessage}`);
    }
  });

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      alert("O nome da equipe é obrigatório.");
      return;
    }

    createTeamMutation.mutate({
      nome: teamName,
      descricao: description || undefined
    });
  };

  // Loading do contexto de autenticação
  if (!user) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden flex items-center justify-center">
          <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p>Carregando...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Verificar se usuário já está em uma equipe
  if (user?.equipe) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden flex items-center justify-center">
          <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">Você já faz parte de uma equipe!</h2>
              <p className="mb-6">Você não pode criar uma nova equipe enquanto estiver em outra.</p>
              <Button onClick={() => navigate("/perfil")} className="bg-blue-500 hover:bg-blue-600 text-white">
                Ir para Perfil
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const silkscreenFont = "[font-family:'Silkscreen',Helvetica]";
  const inputStyle = `bg-white border-2 border-black rounded-md p-2 w-full ${silkscreenFont} text-sm focus:outline-none focus:ring-2 focus:ring-blue-400`;
  const labelStyle = `text-xs ${silkscreenFont} mb-1 block text-black font-bold`;
  const buttonBaseStyle = `${silkscreenFont} border-2 border-black rounded-md px-4 py-2 text-xs font-bold flex items-center justify-center transition-all`;

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className={`w-full min-h-screen [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden ${silkscreenFont}`}>
        {/* Decorative clouds */}
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

        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <Button onClick={handleNavigateBack} variant="outline" className="p-2 bg-white border-2 border-black rounded-md hover:bg-gray-200">
            <ArrowLeft size={24} className="text-black" />
          </Button>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto pt-16 pb-8 px-4 relative z-10">
          <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className={`${silkscreenFont} text-xl font-bold text-[#E3922A] border-2 border-black bg-gray-100 py-2 px-4 rounded-md inline-block`}>
                  CRIAR EQUIPE
                </h1>
              </div>

              {/* FORMULÁRIO PRINCIPAL */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left column - Team info */}
                <div className="space-y-4">
                  {/* Team name */}
                  <div>
                    <label htmlFor="teamName" className={labelStyle}>
                      NOME DA EQUIPE
                    </label>
                    <input
                      type="text"
                      name="teamName"
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="DIGITE O NOME DA EQUIPE"
                      className={inputStyle}
                      disabled={createTeamMutation.isPending}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className={labelStyle}>
                      DESCRIÇÃO (OPCIONAL)
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="DIGITE UMA DESCRIÇÃO PARA A EQUIPE"
                      className={`${inputStyle} h-20 resize-none`}
                      disabled={createTeamMutation.isPending}
                    />
                  </div>

                  {/* Invite code */}
                  <div>
                    <label htmlFor="inviteCode" className={labelStyle}>
                      CÓDIGO DE INVITE
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="inviteCode"
                        id="inviteCode"
                        value="Será gerado automaticamente"
                        readOnly
                        disabled
                        className={`${inputStyle} flex-1 bg-gray-100 text-gray-500`}
                      />
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${silkscreenFont}`}>
                      O código será gerado automaticamente após a criação da equipe
                    </p>
                  </div>

                  {/* Team members */}
                  <div>
                    <label className={labelStyle}>
                      MEMBROS DA EQUIPE
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <div className="flex items-center gap-3 bg-gray-50 border-2 border-black rounded-md p-3">
                        <img
                          src={"/mario.png"}
                          alt={`Avatar de ${user?.nickname || 'Usuário'}`}
                          className="w-12 h-12 rounded-full border-2 border-black object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Crown size={16} className="text-yellow-500" />
                            <span className={`${silkscreenFont} text-sm font-bold text-black`}>
                              {user?.nickname?.toUpperCase() || 'LÍDER'}
                            </span>
                          </div>
                          {/* Remover menção a nível e XP */}
                        </div>
                        <div className={`${silkscreenFont} text-xs text-yellow-600 font-bold`}>
                          LÍDER
                        </div>
                      </div>
                    </div>
                    <p className={`text-xs text-gray-500 mt-2 ${silkscreenFont}`}>
                      Você pode adicionar mais membros após criar a equipe
                    </p>
                  </div>
                </div>

                {/* Right column - Additional info */}
                <div className="space-y-4">
                  <div>
                    <label className={`${labelStyle} mb-3`}>
                      <UserPlus size={16} className="inline mr-2" />
                      INFORMAÇÕES ADICIONAIS
                    </label>

                    <div className="bg-gray-50 border-2 border-black rounded-md p-4">
                      <p className={`${silkscreenFont} text-sm text-black mb-4`}>
                        AO CRIAR UMA EQUIPE:
                      </p>

                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span className={`${silkscreenFont} text-xs text-gray-700`}>
                            VOCÊ SERÁ O LÍDER DA EQUIPE
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span className={`${silkscreenFont} text-xs text-gray-700`}>
                            PODERÁ CONVIDAR OUTROS JOGADORES PARA PARTICIPAR
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span className={`${silkscreenFont} text-xs text-gray-700`}>
                            COMPETIR EM RANKINGS E DESAFIOS EM GRUPO
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-500 font-bold">•</span>
                          <span className={`${silkscreenFont} text-xs text-gray-700`}>
                            GANHAR RECOMPENSAS EXCLUSIVAS PARA EQUIPES
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create button */}
              <div className="flex justify-center mt-8">
                <Button
                  onClick={handleCreateTeam}
                  disabled={!teamName.trim() || createTeamMutation.isPending}
                  className={`${buttonBaseStyle} px-8 py-3 bg-[#29D8FF] hover:bg-[#20B4D2] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {createTeamMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                      CRIANDO...
                    </>
                  ) : (
                    <>
                      <Settings size={18} className="mr-2" />
                      CRIAR EQUIPE
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CriarEquipePage;