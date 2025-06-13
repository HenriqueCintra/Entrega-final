import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Home, Trophy, Clock, Users, Truck, Car } from 'lucide-react';
import { ButtonHomeBack } from "@/components/ButtonHomeBack";

// Desafio Mocado
const desafioMocado = {
  id: "desafio-001",
  titulo: "DESAFIO DE ENTREGA: JUAZEIRO A SALVADOR!",
  descricao: "PREPARE-SE, ESTRATEGISTA! SUA PERÍCIA EM LOGÍSTICA ESTÁ EM JOGO. SUA MISSÃO: TRANSPORTAR 40 CAIXAS DE MADEIRA DE JUAZEIRO DIRETAMENTE PARA SALVADOR.",
  objetivo: "CHEGAR AO DESTINO COM A MAIOR QUANTIDADE DE DINHEIRO POSSÍVEL NO BOLSO!",
  ferramentas: [
    { tipo: "CARRO", descricao: "ÁGIL PARA MANOBRAR E COM BAIXO CONSUMO, MAS QUANTAS VIAGENS SERÃO NECESSÁRIAS PARA LEVAR TODA A CARGA?" },
    { tipo: "CAMINHÃO PEQUENO", descricao: "UM BOM EQUILÍBRIO ENTRE CAPACIDADE E CUSTOS PARA ENTREGAS MENORES." },
    { tipo: "CAMINHÃO MÉDIO", descricao: "LEVA UMA CARGA CONSIDERÁVEL, IDEAL PARA OTIMIZAR O NÚMERO DE VIAGENS." },
    { tipo: "CARRETA", descricao: "CAPACIDADE MÁXIMA! LEVA TUDO DE UMA VEZ, MAS ATENÇÃO AOS CUSTOS DE COMBUSTÍVEL E POSSÍVEIS PEDÁGIOS." }
  ],
  dificuldade: "MÉDIO",
  tempoLimite: "8 HORAS",
  minJogadores: 1,
  maxJogadores: 4,
  imagem: "/desafio.png"
};

export const ApresentacaoDesafioPage = () => {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);

  const handleAceitarDesafio = () => {
    setCarregando(true);
    // Simulando um tempo de carregamento
    setTimeout(() => {
      setCarregando(false);
      navigate("/select-vehicle"); // Rota para iniciar o desafio
    }, 1500);
  };

  const getVehicleIcon = (tipo: string) => {
    switch (tipo) {
      case 'CARRO':
        return <Car size={18} className="text-[#e3922a] mr-2 flex-shrink-0" />;
      default:
        return <Truck size={18} className="text-[#e3922a] mr-2 flex-shrink-0" />;
    }
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden z-10">
        {/* Decoração de nuvens */}
        <img
          className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right opacity-50 -z-10 "
          alt="Cloud decoration"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] -z-10 object-cover animate-float-left opacity-50 scale-110"
          alt="Cloud decoration"
          src="/nuvemright.png"
        />

        {/* Botões de navegação */}
        <div className="flex gap-5 absolute top-4 left-4 z-10">
          <ButtonHomeBack onClick={() => navigate(-1)}><ArrowLeft/></ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/perfil")}><Home/></ButtonHomeBack>
        </div>

        {/* Conteúdo principal */}
        <div className="pt-16 pb-8 px-4 flex justify-center items-center min-h-screen z-10">
          <div className="bg-white rounded-[18px] border-2 border-solid border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-[1000px] max-h-[85vh] overflow-hidden flex flex-col">
            {/* Cabeçalho fixo */}
            <div className="p-4 border-b-2 border-black bg-gray-50">
              <h1 className="text-center text-[22px] [font-family:'Silkscreen',Helvetica] font-bold text-[#e3922a]">
                {desafioMocado.titulo}
              </h1>
            </div>
            
            {/* Conteúdo scrollável */}
            <div className="overflow-y-auto p-4 flex-1">
              {/* Imagem principal */}
              <div className="border-2 border-black rounded-lg overflow-hidden h-[200px] mb-4">
                <img 
                  src={desafioMocado.imagem} 
                  alt="Imagem do desafio" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback se a imagem não carregar
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-truck.png";
                  }}
                />
              </div>

              {/* Descrição */}
              <div className="border-2 border-black rounded-lg p-3 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2">
                  DESCRIÇÃO:
                </h3>
                <p className="[font-family:'Silkscreen',Helvetica] text-[12px]">
                  {desafioMocado.descricao}
                </p>
              </div>

              {/* Detalhes */}
              <div className="border-2 border-black rounded-lg p-3 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2">
                  DETALHES:
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <Trophy size={16} className="text-[#e3922a] mr-2 flex-shrink-0" />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[11px]">
                      DIFICULDADE: {desafioMocado.dificuldade}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock size={16} className="text-[#e3922a] mr-2 flex-shrink-0" />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[11px]">
                      TEMPO: {desafioMocado.tempoLimite}
                    </span>
                  </div>
                  
                  <div className="flex items-center col-span-2">
                    <Users size={16} className="text-[#e3922a] mr-2 flex-shrink-0" />
                    <span className="[font-family:'Silkscreen',Helvetica] text-[11px]">
                      JOGADORES: {desafioMocado.minJogadores}-{desafioMocado.maxJogadores}
                    </span>
                  </div>
                </div>
              </div>

              {/* Objetivo */}
              <div className="border-2 border-black rounded-lg p-3 bg-gray-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2 text-green-600">
                  OBJETIVO:
                </h3>
                <p className="[font-family:'Silkscreen',Helvetica] text-[12px] font-bold text-green-600">
                  {desafioMocado.objetivo}
                </p>
              </div>

              {/* Ferramentas */}
              <div className="border-2 border-dashed border-[#e3922a] rounded-lg p-3 bg-yellow-50 mb-4">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px] mb-2">
                  SUAS FERRAMENTAS:
                </h3>
                <div className="space-y-3">
                  {desafioMocado.ferramentas.map((ferramenta, index) => (
                    <div key={index} className="flex items-start">
                      {getVehicleIcon(ferramenta.tipo)}
                      <div>
                        <span className="[font-family:'Silkscreen',Helvetica] text-[11px] font-bold block">
                          {ferramenta.tipo}
                        </span>
                        <span className="[font-family:'Silkscreen',Helvetica] text-[10px] text-gray-700">
                          {ferramenta.descricao}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Botão de ação fixo no footer */}
            <div className="p-4 border-t-2 flex justify-center border-black bg-gray-50">
              <Button 
                onClick={handleAceitarDesafio}
                disabled={carregando}
                className="w-1/2 py-3 bg-[#29D8FF] border-2 border-black rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[16px] hover:bg-[#20B4D2] transform transition-transform duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {carregando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-4 border-white border-t-black mr-2"></div>
                    CARREGANDO...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2" size={20} />
                    ACEITAR DESAFIO
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApresentacaoDesafioPage; 