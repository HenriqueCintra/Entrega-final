import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Eye, EyeOff, ArrowLeft, Lock } from 'lucide-react';

export const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro específico quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Limpar mensagem de sucesso
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar senha atual
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    // Validar nova senha
    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 8 caracteres';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'Nova senha deve ser diferente da atual';
    }

    // Validar confirmação
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {

      // Simulando uma chamada API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular sucesso
      setSuccessMessage('Senha alterada com sucesso!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/perfil');
      }, 2000);

    } catch (error) {
      // Tratar diferentes tipos de erro
      setErrors({ 
        currentPassword: 'Senha atual incorreta' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/perfil');
  };

  const titleStyle = {
    color: "#E3922A",
    textShadow: "2px 3px 0.6px #000"
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full h-screen overflow-hidden">
      <div className="w-full h-full [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden">
        
        {}
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

        {/* Main content */}
        <div className="max-w-md mx-auto py-8 px-4 relative z-10 h-full flex flex-col justify-center">
          
          {/* Back button */}
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="mb-2 border-2 border-black bg-white hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="[font-family:'Silkscreen',Helvetica] font-bold">VOLTAR</span>
          </Button>

          <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
            <CardContent className="p-4">
              
              {/* Header */}
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-500">
                  <Lock size={24} className="text-orange-500" />
                </div>
                <h2 className="[font-family:'Silkscreen',Helvetica] font-bold text-xl" style={titleStyle}>
                  ALTERAR SENHA
                </h2>
                <p className="[font-family:'Silkscreen',Helvetica] text-xs mt-1 text-gray-600">
                  Olá, {user?.first_name || user?.username}! Altere sua senha abaixo.
                </p>
              </div>

              {/* Success message */}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border-2 border-green-500 rounded-lg text-center">
                  <span className="[font-family:'Silkscreen',Helvetica] text-green-700 font-bold">
                    {successMessage}
                  </span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Current Password */}
                <div>
                  <label className="[font-family:'Silkscreen',Helvetica] text-sm font-bold block mb-2">
                    SENHA ATUAL *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:border-orange-500 [font-family:'Silkscreen',Helvetica]"
                      placeholder="Digite sua senha atual"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent border-0 outline-0 shadow-none focus:outline-0 focus:shadow-none focus:ring-0 active:outline-0 active:shadow-none"
                      style={{ boxShadow: 'none', outline: 'none' }}
                      disabled={isLoading}
                    >
                      {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <span className="text-red-500 text-xs [font-family:'Silkscreen',Helvetica] mt-1 block">
                      {errors.currentPassword}
                    </span>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="[font-family:'Silkscreen',Helvetica] text-sm font-bold block mb-2">
                    NOVA SENHA *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:border-orange-500 [font-family:'Silkscreen',Helvetica]"
                      placeholder="Digite sua nova senha"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent border-0 outline-0 shadow-none focus:outline-0 focus:shadow-none focus:ring-0 active:outline-0 active:shadow-none"
                      style={{ boxShadow: 'none', outline: 'none' }}
                      disabled={isLoading}
                    >
                      {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <span className="text-red-500 text-xs [font-family:'Silkscreen',Helvetica] mt-1 block">
                      {errors.newPassword}
                    </span>
                  )}
                  <span className="text-gray-500 text-xs [font-family:'Silkscreen',Helvetica] mt-1 block">
                    Mínimo de 8 caracteres
                  </span>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="[font-family:'Silkscreen',Helvetica] text-sm font-bold block mb-2">
                    CONFIRMAR NOVA SENHA *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:border-orange-500 [font-family:'Silkscreen',Helvetica]"
                      placeholder="Confirme sua nova senha"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent border-0 outline-0 shadow-none focus:outline-0 focus:shadow-none focus:ring-0 active:outline-0 active:shadow-none"
                      style={{ boxShadow: 'none', outline: 'none' }}
                      disabled={isLoading}
                    >
                      {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-xs [font-family:'Silkscreen',Helvetica] mt-1 block">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-400 text-black hover:bg-orange-500 h-10 border-2 border-black [font-family:'Silkscreen',Helvetica] font-bold mt-4"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                      ALTERANDO...
                    </div>
                  ) : (
                    'ALTERAR SENHA'
                  )}
                </Button>

              </form>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;