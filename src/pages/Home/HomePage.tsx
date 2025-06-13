import { ArrowRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";

export const HomePage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/Login");
  };
  const handleCadastro = () => {
    navigate("/Cadastro");
  };


  return (
    <div className="bg-white flex flex-row justify-center w-full ">
      <div className="bg-white py-5 [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] w-full min-h-screen relative flex flex-col items-center justify-center">
        <Card className="w-[1039px] h-[455px] relative border-[3px] border-solid border-black rounded">
          <CardContent className="p-0 flex h-full">
            {/* Left purple section */}
            <div className="w-[512px] h-full bg-[#561c86] rounded border-r-[3px] border-solid border-black flex flex-col items-center px-12 py-5">
              <h1 className="[font-family:'Silkscreen',Helvetica] font-bold text-white text-[40px] text-center mt-3">
                Jogos Logisticos
              </h1>

              <Card className="w-full h-[202px] mt-8 border-[3px] border-solid border-black flex items-center justify-center bg-[#ffffff]">
                <CardContent className="p-0 flex items-center justify-center h-full">
                  <img
                    className="w-[45%] object-cover"
                    alt="Game logo"
                    src="/Logoifba.png"
                  />
                </CardContent>
              </Card>

              <p className="[font-family:'Silkscreen',Helvetica] font-normal text-white text-[15px] mt-3 text-center">
                Gerencie sua frota de caminhões, escolha
                <br />
                as melhores rotas e faça entregas com eficiência.
              </p>

            
            </div>

            {/* Right section */}
            <div className="flex-1 flex flex-col items-center px-10">
              <h2 className="[text-shadow:2px_3px_0.6px_#000000] [-webkit-text-stroke:1px_#000000] [font-family:'Silkscreen',Helvetica] font-bold text-[#ff8c00e3] text-[40px] text-center mt-5">
                Bem-vindo!
              </h2>

              <div className="w-full mt-16">
                <Button 
                onClick={handleLogin}
                className="w-full h-[58px] bg-[#ffd700] hover:bg-[#e6c200] text-[#1c1a1a] border border-solid border-black rounded-[3px] relative">
                  <span className="[font-family:'Silkscreen',Helvetica] font-bold text-2xl absolute left-1/2 transform -translate-x-1/2">
                    Entrar
                  </span>
                  <ArrowRightIcon className="absolute right-6 w-6 h-[21px]" />
                </Button>
              </div>

              <div className="w-full mt-5 flex items-center justify-center">
                <div className="[font-family:'Signika',Helvetica] font-bold text-[#8d8c8c] text-2xl">
                  <Separator className="inline-block w-[160px] h-px bg-[#8d8c8c]" />
                  <span className="mx-2">OU</span>
                  <Separator className="inline-block w-[160px] h-px bg-[#8d8c8c]" />
                </div>
              </div>

              <div className="w-full mt-10">
                <Button
                 onClick={handleCadastro}
                className="w-full h-[58px] bg-[#16bd81] hover:bg-[#14a974] text-[#1c1a1a] border border-solid border-black rounded-[3px] relative">
                  <span className="[font-family:'Silkscreen',Helvetica] font-bold text-2xl absolute left-1/2 transform -translate-x-1/2">
                    Cadastrar
                  </span>
                  <ArrowRightIcon className="absolute right-6 w-6 h-[21px]" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-5 mb-10">
          <p className="[font-family:'Silkscreen',Helvetica] font-bold text-white text-[15px] text-center">
            © 2025 Jogos Logísticos - Todos os direitos reservados
          </p>
        </footer>
      </div>
    </div>
  );
};
