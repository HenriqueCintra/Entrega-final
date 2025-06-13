import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/button"; 
import {
  Card,
  CardContent,
} from "../../components/ui/card"; 
import {
  ArrowLeft,
  Copy,
  UserPlus,
  Settings,
  Crown,
  Shield,
  User,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  level: number;
  xp: number;
  avatar: string;
  role: 'ADMIN' | 'VICE_LIDER' | 'MEMBRO';
}

interface TeamData {
  name: string;
  inviteCode: string;
  members: TeamMember[];
}

export const EditarEquipePage = () => {
  const navigate = useNavigate();
  
  const [teamData, setTeamData] = useState<TeamData>({
    name: "FRUIT VALE",
    inviteCode: "IF-12345",
    members: [
      {
        id: "1",
        name: "AURELIO DE BOA",
        level: 12,
        xp: 2450,
        avatar: "/mario.png",
        role: "ADMIN"
      },
      {
        id: "2", 
        name: "MARIAZINHA",
        level: 15,
        xp: 3412,
        avatar: "/avatar-placeholder.png",
        role: "MEMBRO"
      }
    ]
  });

  const [newMemberName, setNewMemberName] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleNavigateBack = () => {
    navigate(-1); 
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(teamData.inviteCode);
    alert("Código copiado!");
  };

  const handleGenerateNewCode = () => {
    const newCode = `IF-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setTeamData(prev => ({ ...prev, inviteCode: newCode }));
    alert("Novo código gerado!");
  };

  const handleInviteMember = () => {
    if (!newMemberName.trim()) {
      alert("Digite o nome do membro para convidar");
      return;
    }
    
    setIsInviting(true);
    
    // Simular processo de convite
    setTimeout(() => {
      console.log(`Convite enviado para: ${newMemberName}`);
      alert(`Convite enviado para ${newMemberName}!`);
      setNewMemberName("");
      setIsInviting(false);
    }, 1500);
  };

  const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleSaveChanges = () => {
    console.log("Dados da equipe salvos:", teamData);
    alert("Alterações salvas!");
    navigate("/perfil/editar");
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Crown size={16} className="text-yellow-500" />;
      case 'VICE_LIDER':
        return <Shield size={16} className="text-blue-500" />;
      default:
        return <User size={16} className="text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-yellow-600';
      case 'VICE_LIDER':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
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
                      value={teamData.name} 
                      onChange={handleTeamNameChange}
                      className={inputStyle}
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
                        value={teamData.inviteCode} 
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
                        className={`${buttonBaseStyle} bg-red-500 hover:bg-red-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}
                      >
                        GERAR NOVO
                      </Button>
                    </div>
                  </div>

                  {/* Team members */}
                  <div>
                    <label className={labelStyle}>
                      MEMBROS DA EQUIPE
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {teamData.members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 bg-gray-50 border-2 border-black rounded-md p-3">
                          <img 
                            src={member.avatar} 
                            alt={`Avatar de ${member.name}`}
                            className="w-12 h-12 rounded-full border-2 border-black object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(member.role)}
                              <span className={`${silkscreenFont} text-sm font-bold text-black`}>
                                {member.name}
                              </span>
                            </div>
                            <div className={`${silkscreenFont} text-xs text-gray-600`}>
                              NÍVEL {member.level} • XP {member.xp}
                            </div>
                          </div>
                          <div className={`${silkscreenFont} text-xs ${getRoleColor(member.role)} font-bold`}>
                            {member.role === 'VICE_LIDER' ? 'VICE-LÍDER' : member.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column - Invite member */}
                <div className="space-y-4">
                  <div>
                    <label className={`${labelStyle} mb-3`}>
                      <UserPlus size={16} className="inline mr-2" />
                      ADICIONAR MEMBRO
                    </label>
                    
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={newMemberName} 
                        onChange={(e) => setNewMemberName(e.target.value)}
                        placeholder="NOME DO USUÁRIO"
                        className={inputStyle}
                        disabled={isInviting}
                      />
                      
                      <input 
                        type="text" 
                        placeholder="NOME DO USUÁRIO"
                        className={inputStyle}
                      />
                      
                      <input 
                        type="text" 
                        placeholder="NOME DO USUÁRIO"
                        className={inputStyle}
                      />
                      
                      <input 
                        type="text" 
                        placeholder="NOME DO USUÁRIO"
                        className={inputStyle}
                      />
                    </div>

                    <Button 
                      onClick={handleInviteMember}
                      disabled={isInviting || !newMemberName.trim()}
                      className={`${buttonBaseStyle} w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isInviting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          ENVIANDO...
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} className="mr-2" />
                          ADICIONAR MEMBRO
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Save button */}
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={handleSaveChanges}
                  className={`${buttonBaseStyle} px-8 py-3 bg-[#29D8FF] hover:bg-[#20B4D2] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]`}
                >
                  <Settings size={18} className="mr-2" />
                  SALVAR ALTERAÇÕES
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