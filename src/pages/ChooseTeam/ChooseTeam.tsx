import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '../../api/teamService';
import { Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import TeamCard from '../../components/TeamCard';
import CreateTeamButton from '../../components/CreateTeamButton';
import SelectTeamButton from '../../components/SelectTeamButton';
import { ButtonHomeBack } from '@/components/ButtonHomeBack';
import { ArrowLeft, House, LogIn } from 'lucide-react';

export const ChooseTeam = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, loading } = useAuth();
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [inviteCode, setInviteCode] = useState('');

    // Se ainda está carregando o contexto de autenticação
    if (loading) {
        return <div className="text-white text-center">Carregando...</div>;
    }

    // Se não está logado, redireciona para login
    if (!user) {
        navigate('/login');
        return null;
    }

    // Se já está em uma equipe, redireciona para o perfil
    if (user.equipe) {
        navigate('/game-selection');
        return null;
    }

    // Busca as equipes da API
    const { data: teams, isLoading, isError } = useQuery<Team[]>({
        queryKey: ['teams'],
        queryFn: TeamService.getTeams,
    });

    // Mutação para entrar em uma equipe
    const joinTeamMutation = useMutation({
        mutationFn: (code: string) => TeamService.joinTeam(code),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            alert("Você entrou na equipe com sucesso!");
            navigate("/game-selection");
        },
        onError: (err: any) => {
            const errorMessage = err.response?.data?.detail ||
                err.response?.data?.codigo?.[0] ||
                "Código inválido ou você já está em uma equipe.";
            alert(`Erro: ${errorMessage}`);
        },
    });

    // Função para lidar com o clique no botão "ENTRAR"
    const handleJoinWithCode = () => {
        if (!inviteCode.trim()) {
            alert("Por favor, digite um código de convite.");
            return;
        }
        joinTeamMutation.mutate(inviteCode.trim());
    };

    // Função para lidar com Enter no input
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleJoinWithCode();
        }
    };

    const handleTeamClick = (id: number) => {
        setSelectedTeamId(id);
    };

    const handleCreateTeam = () => {
        navigate("/create-team");
    };

    const handleSelectTeam = () => {
        if (selectedTeamId) {
            // Redireciona para a tela de entrada de código
            navigate("/perfil/entrar-equipe");
        } else {
            alert("Por favor, selecione uma equipe primeiro.");
        }
    };

    if (isLoading) return <div className="text-white text-center">Carregando equipes...</div>;
    if (isError) return <div className="text-red-500 text-center">Erro ao carregar equipes.</div>;

    return (
        <div className="h-screen bg-gradient-to-b from-indigo-900 to-purple-700 font-pixel relative overflow-hidden flex flex-col">
            <img className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right z-0" alt="Nuvem" src="/nuvemleft.png" />
            <img className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110 z-0" alt="Nuvem" src="/nuvemright.png" />

            <div className="relative z-10 flex flex-col flex-1 overflow-y-auto">
                <div className="flex gap-5 mt-14 ml-8">
                    <ButtonHomeBack onClick={() => navigate(-1)}>
                        <ArrowLeft />
                    </ButtonHomeBack>
                    <ButtonHomeBack onClick={() => navigate("/perfil")}>
                        <House />
                    </ButtonHomeBack>
                </div>

                <div className="flex-1 md:pt-20 overflow-auto container mx-auto px-4 py-4">
                    <h1 className="text-2xl md:text-2xl text-yellow-300 font-bold text-center mt-2 mb-8 tracking-wide"
                        style={{ textShadow: '2px 3px 2px black' }}>
                        ESCOLHA SUA EQUIPE
                    </h1>

                    {/* Seção de Criar/Entrar na Equipe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* Bloco de Criar Equipe */}
                        <div className="bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-lg p-4">
                            <CreateTeamButton onClick={handleCreateTeam} />
                        </div>

                        {/* Bloco de Entrar com Código */}
                        <div className="bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-lg p-4 flex flex-col items-center justify-center">
                            <h3 className="font-pixel text-cyan-400 text-center mb-4">ENTRAR COM CÓDIGO</h3>
                            <div className="flex w-full gap-2">
                                <input
                                    type="text"
                                    placeholder="DIGITE O CÓDIGO"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    onKeyPress={handleKeyPress}
                                    maxLength={10}
                                    className="flex-grow bg-white text-black font-bold p-2 border-2 border-black text-center text-xl tracking-widest uppercase"
                                    disabled={joinTeamMutation.isPending}
                                />
                                <button
                                    onClick={handleJoinWithCode}
                                    disabled={joinTeamMutation.isPending || !inviteCode.trim()}
                                    className="bg-green-500 text-black font-bold p-3 border-2 border-black
                           hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all 
                           hover:-translate-x-[2px] hover:-translate-y-[2px] 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {joinTeamMutation.isPending ? '...' : <LogIn size={24} />}
                                </button>
                            </div>
                            {joinTeamMutation.isPending && (
                                <p className="text-yellow-300 text-sm mt-2">Entrando na equipe...</p>
                            )}
                        </div>
                    </div>

                    {/* Lista de Equipes */}
                    <div className="mb-6">
                        <h2 className="text-2xl text-center text-yellow-300 font-bold mb-4 z-10"
                            style={{ textShadow: '2px 3px 2px black' }}>
                            OU ESCOLHA UMA EQUIPE DA LISTA
                        </h2>
                        <div className="space-y-4 overflow-y-auto max-h-60 lg:max-h-[500px] px-1">
                            {teams?.map(team => (
                                <TeamCard
                                    key={team.id}
                                    team={team}
                                    onClick={() => handleTeamClick(team.id)}
                                    selected={team.id === selectedTeamId}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="justify-center flex">
                        <SelectTeamButton onClick={handleSelectTeam} />
                    </div>
                </div>
            </div>
        </div>
    );
};