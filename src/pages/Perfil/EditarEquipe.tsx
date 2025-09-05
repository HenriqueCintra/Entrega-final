import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import {
  ArrowLeft,
  Copy,
  Settings,
  Crown,
  User,
} from 'lucide-react';
import { TeamService } from "../../api/teamService";
import { useAuth } from "../../contexts/AuthContext";

export const EditarEquipePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const teamId = user?.equipe;

  const [teamName, setTeamName] = useState("");

  const handleNavigateBack = () => {
    navigate(-1);
  };

  // Query para buscar dados da equipe
  const { data: teamData, isLoading, error } = useQuery({
    queryKey: ['teamDetails', teamId],
    queryFn: () => TeamService.getTeamDetails(teamId!),
    enabled: !!teamId,
  });

  // Sincronizar nome da equipe com os dados carregados
  useEffect(() => {
    if (teamData) {
      setTeamName(teamData.nome);
    }
  }, [teamData]);

  // Mutação para atualizar nome
  const updateTeamMutation = useMutation({
    mutationFn: (newName: string) =>
      TeamService.updateTeam(teamId!, { nome: newName }),
    onSuccess: () => {
      alert("Nome da equipe atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['teamDetails', teamId] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.nome?.[0] ||
        "Erro ao atualizar equipe.";
      alert(`Erro: ${errorMessage}`);
    },
  });

  // Mutação para regenerar código
  const regenerateCodeMutation = useMutation({
    mutationFn: () => TeamService.regenerateCode(teamId!),
    onSuccess: () => {
      alert("Novo código gerado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['teamDetails', teamId] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail ||
        "Erro ao gerar novo código.";
      alert(`Erro: ${errorMessage}`);
    },
  });

  const handleSaveChanges = () => {
    if (!teamName.trim()) {
      alert("O nome da equipe não pode estar vazio.");
      return;
    }
    updateTeamMutation.mutate(teamName);
  };

  const handleGenerateNewCode = () => {
    if (confirm("Tem certeza que deseja gerar um novo código? O código atual ficará inválido.")) {
      regenerateCodeMutation.mutate();
    }
  };

  const handleCopyInviteCode = () => {
    if (teamData?.codigo) {
      navigator.clipboard.writeText(teamData.codigo);
      alert("Código copiado para a área de transferência!");
    }
  };

  // Estados de loading e erro
  if (isLoading) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden flex items-center justify-center">
          <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p>Carregando dados da equipe...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden flex items-center justify-center">
          <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="text-center text-red-500">
              <p className="mb-4">Erro ao carregar dados da equipe.</p>
              <Button onClick={() => navigate("/perfil")} className="bg-blue-500 hover:bg-blue-600 text-white">
                Voltar ao Perfil
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden flex items-center justify-center">
          <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="text-center">
              <p className="mb-4">Equipe não encontrada.</p>
              <Button onClick={() => navigate("/perfil")} className="bg-blue-500 hover:bg-blue-600 text-white">
                Voltar ao Perfil
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Verificar se é o líder (só após carregar os dados)
  const isLeader = teamData && user && teamData.lider.id === user.id;
  if (teamData && user && !isLeader) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden flex items-center justify-center">
          <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
            <div className="text-center">
              <p className="mb-4">Apenas o líder da equipe pode editar estas informações.</p>
              <Button onClick={() => navigate("/perfil")} className="bg-blue-500 hover:bg-blue-600 text-white">
                Voltar ao Perfil
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const getRoleIcon = (isLider: boolean) => {
    if (isLider) {
      return <Crown size={16} className="text-yellow-500" />;
    }
    return <User size={16} className="text-gray-500" />;
  };

  const getRoleColor = (isLider: boolean) => {
    if (isLider) {
      return 'text-yellow-600';
    }
    return 'text-gray-600';
  };

  const getRoleText = (isLider: boolean) => {
    return isLider ? 'LÍDER' : 'MEMBRO';
  };

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
                  EDITAR EQUIPE
                </h1>
              </div>

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
                      className={inputStyle}
                      disabled={updateTeamMutation.isPending}
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
                        value={teamData.codigo}
                        readOnly
                        className={`${inputStyle} flex-1`}
                      />
                      <Button
                        onClick={handleCopyInviteCode}
                        className={`${buttonBaseStyle} bg-green-500 hover:bg-green-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}
                      >
                        <Copy size={14} />
                      </Button>
                      <Button
                        onClick={handleGenerateNewCode}
                        disabled={regenerateCodeMutation.isPending}
                        className={`${buttonBaseStyle} bg-red-500 hover:bg-red-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50`}
                      >
                        {regenerateCodeMutation.isPending ? "..." : "GERAR NOVO"}
                      </Button>
                    </div>
                  </div>

                  {/* Team members */}
                  <div>
                    <label className={labelStyle}>
                      MEMBROS DA EQUIPE ({teamData.membros.length})
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {teamData.membros.map((member) => {
                        const isLider = member.id === teamData.lider.id;
                        return (
                          <div key={member.id} className="flex items-center gap-3 bg-gray-50 border-2 border-black rounded-md p-3">
                            <img
                              src={member.avatar || "/mario.png"}
                              alt={`Avatar de ${member.nickname}`}
                              className="w-12 h-12 rounded-full border-2 border-black object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {getRoleIcon(isLider)}
                                <span className={`${silkscreenFont} text-sm font-bold text-black`}>
                                  {member.nickname.toUpperCase()}
                                </span>
                              </div>
                              <div className={`${silkscreenFont} text-xs text-gray-600`}>
                                @{member.username || member.nickname}
                              </div>
                            </div>
                            <div className={`${silkscreenFont} text-xs ${getRoleColor(isLider)} font-bold`}>
                              {getRoleText(isLider)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right column - Instructions */}
                <div className="space-y-4">
                  <div>
                    <label className={`${labelStyle} mb-3`}>
                      COMO ADICIONAR MEMBROS
                    </label>

                    <div className="bg-gray-50 border-2 border-black rounded-md p-4">
                      <p className={`${silkscreenFont} text-sm text-black mb-4`}>
                        PARA ADICIONAR NOVOS MEMBROS:
                      </p>

                      <ol className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">1.</span>
                          <span className={`${silkscreenFont} text-xs text-gray-700`}>
                            COMPARTILHE O CÓDIGO DE CONVITE COM OS JOGADORES
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">2.</span>
                          <span className={`${silkscreenFont} text-xs text-gray-700`}>
                            ELES DEVEM USAR O CÓDIGO NA TELA "ENTRAR EM EQUIPE"
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">3.</span>
                          <span className={`${silkscreenFont} text-xs text-gray-700`}>
                            OS NOVOS MEMBROS APARECERÃO AUTOMATICAMENTE AQUI
                          </span>
                        </li>
                      </ol>

                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded">
                        <p className={`${silkscreenFont} text-xs text-yellow-800`}>
                          💡 DICA: CLIQUE EM "COPIAR" PARA FACILITAR O COMPARTILHAMENTO
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-8">
                <Button
                  onClick={handleSaveChanges}
                  disabled={!teamName.trim() || updateTeamMutation.isPending}
                  className={`${buttonBaseStyle} px-8 py-3 bg-[#29D8FF] hover:bg-[#20B4D2] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {updateTeamMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                      SALVANDO...
                    </>
                  ) : (
                    <>
                      <Settings size={18} className="mr-2" />
                      SALVAR ALTERAÇÕES
                    </>
                  )}
                </Button>
                {isLeader && (
                  <Button
                    variant="destructive"
                    className="px-6 py-3 border-2 border-black bg-red-600 text-white hover:bg-red-700"
                    onClick={() => navigate('/perfil/excluir-equipe')}
                  >
                    EXCLUIR EQUIPE
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="px-6 py-3 border-2 border-black bg-gray-200 text-black hover:bg-gray-300"
                  onClick={async () => {
                    if (confirm('Tem certeza que deseja sair da equipe?')) {
                      try {
                        await TeamService.leaveTeam();
                        if (typeof window !== 'undefined' && window.location) {
                          // Força refresh do usuário e redireciona
                          await queryClient.invalidateQueries({ queryKey: ['teamDetails', teamId] });
                          if (typeof window !== 'undefined') {
                            window.location.href = '/perfil';
                          }
                        }
                      } catch (error) {
                        alert('Erro ao sair da equipe. Tente novamente.');
                      }
                    }
                  }}
                >
                  SAIR DA EQUIPE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditarEquipePage;