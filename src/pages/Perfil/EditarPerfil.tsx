import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import AuthService from "../../api/authService";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import {
  ArrowLeft,
  Camera,
  Trophy,
  Edit3,
  LogOut,
  Trash2,
  KeyRound,
  ChevronDown,
  Users,
} from 'lucide-react';

interface UserEditData {
  first_name: string;
  last_name: string;
  email: string;
  data_nascimento?: string;
}

export const EditarPerfilPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, refreshUser, logout } = useAuth();
  const queryClient = useQueryClient();

  // Estado para os dados editáveis
  const [userData, setUserData] = useState<UserEditData>({
    first_name: '',
    last_name: '',
    email: '',
    data_nascimento: ''
  });

  // Estado para avatar local (funcionalidade futura)
  const [localAvatar, setLocalAvatar] = useState<string>("/mario.png");

  // Dados estáticos para exibição (level, XP, equipe)
  const [displayData] = useState({
    level: 12,
    xp: 2450,
    maxXp: 3000,
    xpPercentage: 83,
    team: "FRUIT VALE",
    funcaoEquipe: "COORDENADOR",
  });

  // Carrega dados do usuário quando componente monta
  useEffect(() => {
    if (user) {
      // Converter data para formato YYYY-MM-DD se necessário
      let dataFormatada = '';
      if (user.data_nascimento) {
        // Se vier no formato DD/MM/YYYY, converter para YYYY-MM-DD
        if (user.data_nascimento.includes('/')) {
          const [dia, mes, ano] = user.data_nascimento.split('/');
          dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
        // Se vier no formato YYYY-MM-DD, usar direto
        else if (user.data_nascimento.includes('-')) {
          dataFormatada = user.data_nascimento;
        }
        // Outros formatos
        else {
          dataFormatada = user.data_nascimento;
        }
      }

      setUserData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        data_nascimento: dataFormatada
      });
    }
  }, [user]);

  // Mutation para atualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: (data: UserEditData) => {
      console.log('🌐 DEBUG - Enviando requisição PATCH para /auth/perfil/ com:', data);
      return AuthService.updateProfile(data);
    },
    onSuccess: async (response) => {
      console.log('✅ DEBUG - Resposta de sucesso do backend:', response.data);

      // Atualiza os dados no contexto
      await refreshUser();

      console.log('🔄 DEBUG - Usuário atualizado no contexto');

      // Invalida queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Mostra sucesso e navega
      alert("Alterações salvas com sucesso!");
      navigate("/perfil");
    },
    onError: (error: any) => {
      console.error("❌ DEBUG - Erro completo:", error);
      console.error("❌ DEBUG - Resposta do servidor:", error.response?.data);
      console.error("❌ DEBUG - Status do erro:", error.response?.status);

      const errorMessage = error.response?.data?.detail ||
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Erro ao salvar alterações";
      alert(`Erro: ${errorMessage}`);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setLocalAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor, selecione apenas arquivos de imagem.');
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSalvarAlteracoes = () => {
    console.log('💾 DEBUG - Iniciando salvamento com dados:', userData);

    // Valida dados básicos
    if (!userData.email.trim()) {
      alert("Email é obrigatório!");
      return;
    }

    // Prepara dados para envio (remove campos vazios)
    const dataToSend: Partial<UserEditData> = {};

    if (userData.first_name.trim()) dataToSend.first_name = userData.first_name.trim();
    if (userData.last_name.trim()) dataToSend.last_name = userData.last_name.trim();
    if (userData.email.trim()) dataToSend.email = userData.email.trim();
    if (userData.data_nascimento?.trim()) dataToSend.data_nascimento = userData.data_nascimento.trim();

    console.log('📤 DEBUG - Dados que serão enviados para o backend:', dataToSend);

    updateProfileMutation.mutate(dataToSend as UserEditData);
  };

  const handleNavigateBack = () => {
    navigate(-1);
  };

const handleTeamSettings = () => {
  navigate("/perfil/editar-equipe");
};

  const handleSairDaEquipe = () => {
    console.log("Sair da equipe");
    // TODO: Implementar API para sair da equipe
    alert("Funcionalidade em desenvolvimento!");
  };

  const handleExcluirEquipe = () => {
    navigate("/perfil/excluir-equipe");
  };

  const handleChangePassword = () => {
    navigate("/mudar-senha");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Se não há usuário logado, redireciona
  if (!user) {
    navigate("/login");
    return null;
  }

  const silkscreenFont = "[font-family:'Silkscreen',Helvetica]";
  const inputStyle = `bg-white border-2 border-black rounded-md p-2 w-full ${silkscreenFont} text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400`;
  const labelStyle = `text-xs ${silkscreenFont} mb-1 block text-black`;
  const buttonBaseStyle = `${silkscreenFont} border-2 border-black rounded-md px-4 py-2 text-xs font-bold flex items-center justify-center`;

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

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-20">
          <Button onClick={handleNavigateBack} variant="outline" className="p-2 bg-white border-2 border-black rounded-md hover:bg-gray-200">
            <ArrowLeft size={24} className="text-black" />
          </Button>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto pt-16 pb-8 px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* Left column - User profile */}
            <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-4 md:p-5">
                <div className="text-center mb-4">
                  {/* Avatar section */}
                  <div className="mt-1 flex justify-center">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-full bg-[#00FFFF] border-2 border-black flex items-center justify-center overflow-hidden relative group">
                        <img
                          src={localAvatar}
                          alt="Avatar"
                          className="w-24 h-24 object-cover rounded-full"
                        />
                        <div
                          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer rounded-full"
                          onClick={handleClickUpload}
                        >
                          <Camera size={28} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className={`${silkscreenFont} font-bold text-black text-lg mt-3`}>
                    {(user.nickname || user.username).toUpperCase()}
                  </h3>

                  <div className="flex items-center justify-center mt-1">
                    <span className="text-yellow-500 mr-1">🏆</span>
                    <span className={`${silkscreenFont} text-black text-sm`}>
                      NÍVEL {displayData.level}
                    </span>
                  </div>

                  {/* XP Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-black ${silkscreenFont} mb-1">
                      <span>XP: {displayData.xp}/{displayData.maxXp}</span>
                      <span>{displayData.xpPercentage}%</span>
                    </div>
                    <div className="w-full h-5 bg-gray-300 rounded-sm overflow-hidden border border-black">
                      <div
                        className="h-full bg-yellow-400 border-r border-black"
                        style={{ width: `${displayData.xpPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-3 mt-4">
                  <div>
                    <label htmlFor="first_name" className={labelStyle}>NOME</label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      value={userData.first_name}
                      onChange={handleInputChange}
                      className={inputStyle}
                      placeholder="Seu primeiro nome"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className={labelStyle}>SOBRENOME</label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      value={userData.last_name}
                      onChange={handleInputChange}
                      className={inputStyle}
                      placeholder="Seu sobrenome"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>USUÁRIO (não pode ser alterado)</label>
                    <input
                      type="text"
                      value={user.nickname || user.username}
                      className={`${inputStyle} bg-gray-200 cursor-not-allowed opacity-70`}
                      disabled
                      readOnly
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelStyle}>EMAIL</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      className={inputStyle}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="data_nascimento" className={labelStyle}>DATA DE NASCIMENTO</label>
                    <input
                      type="date"
                      name="data_nascimento"
                      id="data_nascimento"
                      value={userData.data_nascimento}
                      onFocus={() => console.log('📅 DEBUG - Data atual no campo:', userData.data_nascimento)}
                      onChange={(e) => {
                        console.log('📅 DEBUG - Nova data selecionada:', e.target.value);
                        handleInputChange(e);
                      }}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleSalvarAlteracoes}
                    disabled={updateProfileMutation.isPending}
                    className={`${buttonBaseStyle} w-auto px-6 py-1.5 bg-[#29D8FF] hover:bg-[#20B4D2] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50`}
                  >
                    {updateProfileMutation.isPending ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right column - Team and actions */}
            <div className="space-y-5">
              <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`${silkscreenFont} text-base text-black`}>
                      EQUIPE : <span className="text-[#E3922A] font-bold">
                        {user.equipe ? displayData.team.toUpperCase() : 'SEM EQUIPE'}
                      </span>
                    </h3>
                    <Button variant="ghost" onClick={handleTeamSettings} className="p-1 hover:bg-gray-200 rounded">
                      <Edit3 size={18} className="text-black" />
                    </Button>
                  </div>

                  {/* Team info box */}
                  <div className="bg-gray-100 border-2 border-black rounded-md p-3 mb-4">
                    <div className="flex items-center mb-3">
                      <div className="flex flex-col items-center mr-4">
                        <p className={`${silkscreenFont} text-black text-sm mb-1 text-center`}>
                          {user.equipe ? 'LÍDER' : 'SEM EQUIPE'}
                        </p>
                        <img
                          src="/avatar-placeholder.png"
                          alt="Team Leader Avatar"
                          className="w-12 h-12 rounded-sm bg-gray-300 border border-black"
                        />
                      </div>
                      <div className={`${silkscreenFont} text-black text-xs flex flex-col space-y-1`}>
                        <div className="flex items-center"><Trophy size={16} className="mr-1 text-yellow-500" /> 4</div>
                        <div className="flex items-center"><Users size={16} className="mr-1" /> 5</div>
                        <div className="flex items-center"><Trophy size={16} className="mr-1 text-orange-400" /> 9</div>
                      </div>
                    </div>

                    {user.equipe ? (
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSairDaEquipe}
                          className={`${buttonBaseStyle} flex-1 bg-white hover:bg-gray-100 text-black text-[10px] leading-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}
                        >
                          <LogOut size={14} className="mr-1 md:mr-2" /> SAIR DA EQUIPE
                        </Button>
                        <Button
                          onClick={handleExcluirEquipe}
                          className={`${buttonBaseStyle} flex-1 bg-red-500 hover:bg-red-600 text-white text-[10px] leading-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}
                        >
                          <Trash2 size={14} className="mr-1 md:mr-2" /> EXCLUIR EQUIPE
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Button
                          onClick={() => navigate('/equipes')}
                          className={`${buttonBaseStyle} bg-green-500 hover:bg-green-600 text-white text-sm`}
                        >
                          ENTRAR EM UMA EQUIPE
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Team role selector */}
                  {user.equipe && (
                    <div>
                      <label htmlFor="funcaoEquipe" className={`${labelStyle} mb-1`}>FUNÇÃO</label>
                      <div className="relative">
                        <select
                          name="funcaoEquipe"
                          id="funcaoEquipe"
                          value={displayData.funcaoEquipe}
                          onChange={() => { }} // TODO: Implementar mudança de função
                          className={`${inputStyle} appearance-none pr-8`}
                          disabled
                        >
                          <option value="COORDENADOR">COORDENADOR</option>
                          <option value="MEMBRO">MEMBRO</option>
                          <option value="VICE-LIDER">VICE-LIDER</option>
                        </select>
                        <ChevronDown size={20} className="absolute right-2 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleChangePassword}
                  className={`${buttonBaseStyle} w-full bg-white hover:bg-gray-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]`}
                >
                  <KeyRound size={18} className="mr-2" /> ALTERAR SENHA
                </Button>
                <Button
                  onClick={handleLogout}
                  className={`${buttonBaseStyle} w-full bg-white hover:bg-gray-100 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]`}
                >
                  <LogOut size={18} className="mr-2" /> SAIR
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfilPage;