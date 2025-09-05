import { useNavigate } from "react-router-dom";
import { 
  Play, 
  User, 
  RotateCcw
} from 'lucide-react';

interface PauseMenuProps {
  isVisible: boolean;
  onResume: () => void;
  onGoToProfile?: () => void;
  onRestart?: () => void;
}

export const PauseMenu = ({ 
  isVisible, 
  onResume,
  onGoToProfile,
  onRestart
}: PauseMenuProps) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  const handleGoToProfile = () => {
    if (onGoToProfile) {
      onGoToProfile();
    } else {
      navigate("/perfil");
    }
  };

  const silkscreenFont = "[font-family:'Silkscreen',Helvetica]";
  const titleStyle = {
    color: "#E3922A",
    textShadow: "2px 3px 0.6px #000"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="w-full h-full [background:linear-gradient(180deg,rgba(57,189,248,0.9)_0%,rgba(154,102,248,0.9)_100%)] relative overflow-hidden flex items-center justify-center">
        
        {}
        <img
          className="w-[300px] h-[120px] absolute top-[100px] left-[50px] object-cover animate-float-right opacity-40"
          alt="Cloud decoration"
          src="/nuvemleft.png"
        />
        <img
          className="w-[350px] h-[140px] absolute bottom-[50px] right-[50px] object-cover animate-float-left opacity-40"
          alt="Cloud decoration"
          src="/nuvemright.png"
        />

        {/* Menu principal */}
        <div className="border-4 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full mx-4 relative z-10">
          <div className="p-6">
            
            {/* Título */}
            <div className="text-center mb-6">
              <h1 className={`${silkscreenFont} text-3xl font-bold`} style={titleStyle}>
                JOGO PAUSADO
              </h1>
              <div className="w-full h-1 bg-black mt-2"></div>
            </div>

            {/* Botões principais */}
            <div className="space-y-4">
              
              {/* Continuar Jogo */}
              <button
                onClick={onResume}
                className={`${silkscreenFont} w-full py-4 text-lg font-bold bg-green-500 hover:bg-green-600 text-white border-2 border-black rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center`}
              >
                <Play size={20} className="mr-2" />
                CONTINUAR
              </button>

              {/* Grid de opções */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Perfil */}
                <button
                  onClick={handleGoToProfile}
                  className={`${silkscreenFont} py-4 text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white border-2 border-black rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex flex-col items-center`}
                >
                  <User size={20} className="mb-1" />
                  PERFIL
                </button>

                {/* Reiniciar */}
                {onRestart && (
                  <button
                    onClick={onRestart}
                    className={`${silkscreenFont} py-4 text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white border-2 border-black rounded-md shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex flex-col items-center`}
                  >
                    <RotateCcw size={20} className="mb-1" />
                    REINICIAR
                  </button>
                )}
              </div>
            </div>

            {/* Dica */}
            <div className="text-center mt-6">
              <p className={`${silkscreenFont} text-xs text-gray-600`}>
                Pressione ESC para pausar/despausar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PauseMenu;