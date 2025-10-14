import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { AudioControl } from "../../components/AudioControl";
import { Truck, MapPin, Fuel, Users, Github, Linkedin } from "lucide-react";
import { teamMembers, TeamMember } from "./TeamData";

// Componente para card de membro da equipe
const TeamMemberCard = ({ member }: { member: TeamMember }) => (
  <Card className="border-[3px] border-solid border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <CardContent className="p-6">
      <h4 className="[font-family:'Silkscreen',Helvetica] font-bold text-[#561c86] text-2xl mb-2">
        {member.name}
      </h4>
      <p className="[font-family:'Silkscreen',Helvetica] text-[#e3922a] text-sm mb-3 font-bold">
        {member.role}
      </p>
      <p className="[font-family:'Silkscreen',Helvetica] text-gray-700 text-xs leading-relaxed mb-4">
        {member.description}
      </p>
      <div className="flex gap-3">
        {member.github && (
          <a
            href={member.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#561c86] hover:bg-[#7946d5] text-white px-3 py-2 rounded border-2 border-black transition-colors"
          >
            <Github size={16} />
            <span className="[font-family:'Silkscreen',Helvetica] text-xs">GitHub</span>
          </a>
        )}
        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0077b5] hover:bg-[#006399] text-white px-3 py-2 rounded border-2 border-black transition-colors"
          >
            <Linkedin size={16} />
            <span className="[font-family:'Silkscreen',Helvetica] text-xs">LinkedIn</span>
          </a>
        )}
      </div>
    </CardContent>
  </Card>
);

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen overflow-hidden [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative">
      {/* Nuvens animadas - fixas no fundo */}
      <img className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right pointer-events-none z-0" alt="Nuvem" src="/nuvemleft.png" />
      <img className="w-[436px] h-[170px] absolute top-[600px] right-[27px] object-cover animate-float-left opacity-75 scale-110 pointer-events-none z-0" alt="Nuvem" src="/nuvemright.png" />

      {/* Container com scroll */}
      <div className="w-full h-full overflow-y-auto overflow-x-hidden">
        {/* Header com botões */}
        <header className="relative z-30 flex justify-between items-center px-8 py-6">
          <div className="flex items-center gap-3">
            <img src="/Logoifba.png" alt="Logo IFBA" className="h-16 w-auto" />
            <h1 className="[font-family:'Silkscreen',Helvetica] font-bold text-white text-2xl">
              Jogos Logísticos
            </h1>
          </div>
          <div className="flex gap-4 items-center">
            <Button
              onClick={() => navigate("/cadastro")}
              className="bg-[#16bd81] hover:bg-[#14a974] text-white px-6 py-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] [font-family:'Silkscreen',Helvetica] h-12 transform transition-transform duration-300 hover:scale-105"
            >
              Cadastro
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-[#ffd700] hover:bg-[#e6c200] text-black px-6 py-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] [font-family:'Silkscreen',Helvetica] h-12 transform transition-transform duration-300 hover:scale-105"
            >
              Login
            </Button>
            <AudioControl />
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 flex flex-col items-center justify-center px-8 py-16">
          <Card className="w-full max-w-5xl border-[3px] border-solid border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardContent className="p-12 text-center">
              <h2 className="[font-family:'Silkscreen',Helvetica] font-bold text-[#561c86] text-5xl mb-6">
                Bem-vindo aos Jogos Logísticos!
              </h2>
              <p className="[font-family:'Silkscreen',Helvetica] text-gray-700 text-lg leading-relaxed">
                Uma plataforma educacional interativa para aprender conceitos fundamentais de logística através de jogos envolventes.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* História Section */}
        <section className="relative z-10 px-8 py-12">
          <div className="max-w-5xl mx-auto">
            <Card className="border-[3px] border-solid border-black rounded-lg bg-[#561c86] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-10">
                <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-white text-4xl mb-6 text-center">
                  📖 A História
                </h3>
                <div className="space-y-4 text-white [font-family:'Silkscreen',Helvetica] text-base leading-relaxed">
                  <p>
                    Você é o novo gerente de logística de uma empresa de transportes que atende toda a região. Sua missão é garantir que todas as entregas sejam realizadas com eficiência, economia e pontualidade.
                  </p>
                  <p>
                    Enfrente desafios reais do dia a dia logístico: escolha os veículos adequados para cada carga, planeje as melhores rotas considerando distância e consumo de combustível, e gerencie o abastecimento da sua frota.
                  </p>
                  <p>
                    Cada decisão impacta nos custos operacionais e na satisfação dos clientes. Você está pronto para se tornar um expert em logística?
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Como Jogar Section */}
        <section className="relative z-10 px-8 py-12">
          <div className="max-w-5xl mx-auto">
            <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-white text-4xl mb-8 text-center">
              🎮 Como Jogar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-[3px] border-solid border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform transition-transform duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-[#ffd700] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                    <Truck size={32} className="text-black" />
                  </div>
                  <h4 className="[font-family:'Silkscreen',Helvetica] font-bold text-xl mb-3">1. Escolha o Veículo</h4>
                  <p className="[font-family:'Silkscreen',Helvetica] text-sm text-gray-700">
                    Selecione o caminhão ideal considerando capacidade de carga e consumo de combustível.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[3px] border-solid border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform transition-transform duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-[#16bd81] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                    <MapPin size={32} className="text-white" />
                  </div>
                  <h4 className="[font-family:'Silkscreen',Helvetica] font-bold text-xl mb-3">2. Planeje a Rota</h4>
                  <p className="[font-family:'Silkscreen',Helvetica] text-sm text-gray-700">
                    Analise as opções de rotas e escolha a mais eficiente em termos de distância e custo.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-[3px] border-solid border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform transition-transform duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="bg-[#e3922a] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                    <Fuel size={32} className="text-black" />
                  </div>
                  <h4 className="[font-family:'Silkscreen',Helvetica] font-bold text-xl mb-3">3. Gerencie Combustível</h4>
                  <p className="[font-family:'Silkscreen',Helvetica] text-sm text-gray-700">
                    Abasteça seu veículo e complete minigames para otimizar seus recursos.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sobre Section */}
        <section className="relative z-10 px-8 py-12 mb-16">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Sobre o Projeto */}
            <Card className="border-[3px] border-solid border-black rounded-lg bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-10">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <Users size={40} className="text-[#561c86]" />
                  <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-[#561c86] text-4xl text-center">
                    Sobre o Projeto
                  </h3>
                </div>
                <div className="space-y-4 [font-family:'Silkscreen',Helvetica] text-gray-700 text-base leading-relaxed">
                  <p>
                    Os <strong>Jogos Logísticos</strong> foram desenvolvidos pelo <strong>CEPEDI</strong> (Centro de Pesquisa e Desenvolvimento Tecnológico) em parceria com o <strong>IFBA - Campus Juazeiro</strong>.
                  </p>
                  <p>
                    Este projeto faz parte de uma iniciativa educacional para promover o aprendizado ativo de conceitos de logística através de experiências práticas e interativas.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Equipe */}
            <div>
              <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-white text-4xl mb-6 text-center">
                👥 Nossa Equipe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamMembers.map((member, index) => (
                  <TeamMemberCard key={index} member={member} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-8 text-center">
          <p className="[font-family:'Silkscreen',Helvetica] font-bold text-white text-sm">
            © 2025 Jogos Logísticos - CEPEDI & IFBA Juazeiro - Todos os direitos reservados
          </p>
        </footer>
      </div>
    </div>
  );
};
