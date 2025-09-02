// src/pages/Tutorial/TutorialPage.tsx

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Home } from 'lucide-react'; 
import { ButtonHomeBack } from "@/components/ButtonHomeBack";
import { useNavigate } from "react-router-dom";

export const TutorialPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const tutorialSteps = [
    {
      number: "1)",
      title: "ESCOLHA UM NOME PARA SUA EQUIPE.",
      description: "DEFINA OS MEMBROS E ATRIBUA FUNÇÕES ESTRATÉGICAS."
    },
    {
      number: "2)",
      title: "ESCOLHA O TIPO E QUANTIDADE DE CAMINHÕES.",
      description: "DEFINA A MELHOR ROTA CONSIDERANDO CUSTO E TEMPO. RESERVE UM ORÇAMENTO PARA EMERGÊNCIAS."
    },
    {
      number: "3)",
      title: "O JOGO SIMULA O TRANSPORTE EM TEMPO REAL.",
      description: "EVENTOS ALEATÓRIOS PODEM IMPACTAR A VIAGEM! VOCÊ PODE TOMAR DECISÕES PARA MINIMIZAR ATRASOS E CUSTOS."
    },
    {
      number: "4)",
      title: "VOCÊ SERÁ AVALIADO COM BASE EM:",
      description: (
        <div className="flex flex-col">
          <div className="flex items-start">
            <div className="w-5 h-5 bg-green-500 mr-2 mt-1"></div>
            <span>EFICIÊNCIA DE CUSTOS.</span>
          </div>
          <div className="flex items-start">
            <div className="w-5 h-5 bg-blue-500 mr-2 mt-1"></div>
            <span>CUMPRIMENTO DO PRAZO.</span>
          </div>
          <div className="flex items-start">
            <div className="w-5 h-5 bg-orange-500 mr-2 mt-1"></div>
            <span>CRIATIVIDADE NA RESOLUÇÃO DE PROBLEMAS.</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(32,2,89,1)_0%,rgba(121,70,213,1)_100%)] relative overflow-hidden">
        <img
          className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right"
          alt="Cloud decoration"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110"
          alt="Cloud decoration"
          src="/nuvemright.png"
        />

        <div className="flex gap-5 absolute top-14 left-[33px]">
          <ButtonHomeBack onClick={() => navigate(-1)}><ArrowLeft/></ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/perfil")}><Home/></ButtonHomeBack>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-[750px]">
          <div className="bg-white rounded-[18px] border-2 border-solid border-black p-6">
            <h1 className="text-center text-[35px] [font-family:'Silkscreen',Helvetica] font-bold mb-6">
              TUTORIAL
            </h1>
            <p className="text-center [font-family:'Silkscreen',Helvetica] text-[14px] mb-6">
              NESTE JOGO, VOCÊ ASSUMIRÁ O PAPEL DE UMA EMPRESA DE LOGÍSTICA E PRECISARÁ PLANEJAR E
              EXECUTAR A ENTREGA DE MERCADORIAS DA FORMA MAIS EFICIENTE POSSÍVEL.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-6">
              {tutorialSteps.map((step, index) => (
                <div key={index} className="flex">
                  <div className="mr-3">
                    <div className="text-[24px] [font-family:'Silkscreen',Helvetica] font-bold text-[#e3922a]">
                      {step.number}
                    </div>
                  </div>
                  <div>
                    <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[14px]">
                      {step.title}
                    </h3>
                    <div className="[font-family:'Silkscreen',Helvetica] text-[12px] mt-1">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center [font-family:'Silkscreen',Helvetica] text-[12px] mb-6">
              AGORA QUE VOCÊ CONHECE AS REGRAS, ESTÁ PRONTO PARA O DESAFIO BOA SORTE!
            </p>
            <div className="flex justify-center">
              {/* ✅ BOTÃO CORRIGIDO: Navega para a rota estática /desafio */}
              <Button 
                onClick={() => navigate("/desafio")}
                className="w-[230px] px-36 h-[45px] bg-[#e3922a] rounded-md [font-family:'Silkscreen',Helvetica] font-bold text-black text-[26px] hover:bg-[#e3922a] transform transition-transform duration-300 hover:scale-105"
              >
                INICIAR JOGO
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
