import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/button"; 
import {
  Card,
  CardContent,
} from "../../components/ui/card"; 
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Users,
  Trophy,
} from 'lucide-react';

interface TeamData {
  name: string;
  memberCount: number;
  trophies: number;
  level: number;
  adminName: string;
}

export const ExcluirEquipePage = () => {
  const navigate = useNavigate();
  
  const [teamData] = useState<TeamData>({
    name: "FRUIT VALE",
    memberCount: 5,
    trophies: 24,
    level: 12,
    adminName: "AURELIO DE BOA",
  });

  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNavigateBack = () => {
    navigate(-1); 
  };

  const handleConfirmDelete = async () => {
    if (confirmationText.toUpperCase() !== teamData.name.toUpperCase()) {
      alert("O nome da equipe não confere. Digite exatamente como mostrado.");
      return;
    }

    setIsDeleting(true);
    
    setTimeout(() => {
      console.log("Equipe excluída");
      alert("Equipe excluída com sucesso!");
      navigate("/perfil");
    }, 2000);
  };

  const handleCancel = () => {
    navigate("/perfil/editar");
  };

  const silkscreenFont = "[font-family:'Silkscreen',Helvetica]";
  const inputStyle = `bg-white border-2 border-black rounded-md p-3 w-full ${silkscreenFont} text-sm focus:outline-none focus:ring-2 focus:ring-red-400`;
  const labelStyle = `text-sm ${silkscreenFont} mb-2 block text-black font-bold`;
  const buttonBaseStyle = `${silkscreenFont} border-2 border-black rounded-md px-6 py-3 text-sm font-bold flex items-center justify-center transition-all`;

  const isConfirmationValid = confirmationText.toUpperCase() === teamData.name.toUpperCase();

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className={`w-full min-h-screen [background:linear-gradient(180deg,rgba(220,53,69,1)_0%,rgba(108,117,125,1)_100%)] relative overflow-hidden ${silkscreenFont}`}>
        {}
        <img
          className="w-[375px] h-[147px] absolute top-[80px] left-[calc(50%_-_650px)] object-cover animate-float-right opacity-60"
          alt="Cloud decoration left"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[calc(50%_-_700px)] object-cover animate-float-left opacity-55 scale-110"
          alt="Cloud decoration right"
          src="/nuvemright.png"
        />

        {}
        <div className="absolute top-4 left-4 z-20">
          <Button onClick={handleNavigateBack} variant="outline" className="p-2 bg-white border-2 border-black rounded-md hover:bg-gray-200">
            <ArrowLeft size={24} className="text-black" />
          </Button>
        </div>
        
        {}
        <div className="max-w-2xl mx-auto pt-16 pb-8 px-4 relative z-10">
          <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              {}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
                    <AlertTriangle size={40} className="text-red-500" />
                  </div>
                </div>
                <h1 className={`${silkscreenFont} text-2xl font-bold text-red-600 mb-2`}>
                  EXCLUIR EQUIPE
                </h1>
                <p className={`${silkscreenFont} text-sm text-gray-700`}>
                  ESTA AÇÃO NÃO PODE SER DESFEITA
                </p>
              </div>

              {}
              <div className="bg-gray-50 border-2 border-black rounded-md p-4 mb-6">
                <h3 className={`${silkscreenFont} text-lg font-bold text-black mb-3 text-center`}>
                  EQUIPE: <span className="text-red-600">{teamData.name}</span>
                </h3>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Users size={24} className="text-gray-600 mb-1" />
                    <span className={`${silkscreenFont} text-xs text-gray-600`}>MEMBROS</span>
                    <span className={`${silkscreenFont} text-lg font-bold text-black`}>{teamData.memberCount}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Trophy size={24} className="text-yellow-500 mb-1" />
                    <span className={`${silkscreenFont} text-xs text-gray-600`}>TROFÉUS</span>
                    <span className={`${silkscreenFont} text-lg font-bold text-black`}>{teamData.trophies}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl mb-1">⭐</span>
                    <span className={`${silkscreenFont} text-xs text-gray-600`}>NÍVEL</span>
                    <span className={`${silkscreenFont} text-lg font-bold text-black`}>{teamData.level}</span>
                  </div>
                </div>
              </div>

              {}
              <div className="bg-red-50 border-2 border-red-300 rounded-md p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle size={20} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className={`${silkscreenFont} text-sm font-bold text-red-700 mb-2`}>
                      ATENÇÃO: AO EXCLUIR A EQUIPE
                    </h4>
                    <ul className={`${silkscreenFont} text-xs text-red-600 space-y-1`}>
                      <li>• TODOS OS MEMBROS SERÃO REMOVIDOS</li>
                      <li>• TODO O PROGRESSO SERÁ PERDIDO</li>
                      <li>• OS TROFÉUS CONQUISTADOS SERÃO APAGADOS</li>
                      <li>• ESTA AÇÃO NÃO PODE SER REVERTIDA</li>
                    </ul>
                  </div>
                </div>
              </div>

              {}
              <div className="mb-6">
                <label htmlFor="confirmationText" className={labelStyle}>
                  PARA CONFIRMAR, DIGITE O NOME DA EQUIPE:
                </label>
                <div className="mb-2">
                  <span className={`${silkscreenFont} text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded border`}>
                    {teamData.name}
                  </span>
                </div>
                <input 
                  type="text" 
                  name="confirmationText" 
                  id="confirmationText" 
                  value={confirmationText} 
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className={inputStyle}
                  placeholder="DIGITE O NOME DA EQUIPE AQUI"
                  disabled={isDeleting}
                />
                {confirmationText && !isConfirmationValid && (
                  <p className={`${silkscreenFont} text-xs text-red-500 mt-1`}>
                    O nome não confere
                  </p>
                )}
              </div>

              {}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleCancel}
                  disabled={isDeleting}
                  className={`${buttonBaseStyle} flex-1 bg-gray-200 hover:bg-gray-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  CANCELAR
                </Button>
                <Button 
                  onClick={handleConfirmDelete}
                  disabled={!isConfirmationValid || isDeleting}
                  className={`${buttonBaseStyle} flex-1 bg-red-500 hover:bg-red-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      EXCLUINDO...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} className="mr-2" />
                      EXCLUIR EQUIPE
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

export default ExcluirEquipePage;