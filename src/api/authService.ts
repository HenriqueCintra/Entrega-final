
import api from './config';

// --- INTERFACES CORRETAS ---
interface LoginCredentials {
  username: string;
  password: string;
}

// Interface que corresponde à resposta do backend (simple-jwt)
interface TokenResponse {
  access: string;
  refresh: string;
}

// Interface para os dados do usuário que vêm da API
interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  nickname: string;
  first_name?: string;
  last_name?: string;
  data_nascimento?: string;
  equipe?: number;
}

// Interface para atualização de perfil
interface UpdateProfileData {
  email?: string;
  first_name?: string;
  last_name?: string;
  data_nascimento?: string;
}

// Interface para dados de registro
interface RegisterData {
  username: string;
  password: string;
  password_confirm: string;
  email: string;
  first_name: string;
  last_name?: string;
  nickname: string;
  data_nascimento?: string;
}

// --- CLASSE DE SERVIÇO COM URLS E LÓGICA CORRIGIDAS ---

class AuthServiceClass {
  private tokenKey = 'token';
  private refreshTokenKey = 'refreshToken';

  /**
   * Realiza login do usuário.
   */
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    try {
      console.log('🔐 Tentando login com a URL correta...');

      // ✅ CORREÇÃO APLICADA: URL correta para obter o token
      const response = await api.post<TokenResponse>('/auth/token/', credentials);

      const { access, refresh } = response.data;

      if (access) {
        localStorage.setItem(this.tokenKey, access);
      }
      if (refresh) {
        localStorage.setItem(this.refreshTokenKey, refresh);
      }

      console.log('✅ Login bem-sucedido. Tokens armazenados.');
      return response.data;

    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      this.logout(); // Limpa tokens em caso de falha
      if (error.response?.status === 401) {
        throw new Error('Usuário ou senha incorretos.');
      }
      throw new Error('Falha ao realizar login. Tente novamente mais tarde.');
    }
  }

async register(userData: RegistrationData): Promise<any> {
    try {
      console.log('📝 Tentando registrar novo usuário...');
      const response = await api.post('/auth/registro/', userData);
      console.log('✅ Registro bem-sucedido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro no registro:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtém o perfil do usuário logado.
   */
  async getProfile(): Promise<{ data: UserProfileResponse }> {
    try {
      console.log('👤 Buscando perfil com a URL correta...');

      // ✅ CORREÇÃO APLICADA: URL correta para o perfil do usuário
      const response = await api.get<UserProfileResponse>('/auth/perfil/');

      console.log('✅ Perfil obtido com sucesso:', response.data.username);
      return { data: response.data };

    } catch (error: any) {
      console.error('❌ Erro ao obter perfil:', error);
      if (error.response?.status === 401) {
        this.logout();
      }
      throw error;
    }
  }

  /**
   * Registra um novo usuário.
   */
  async register(userData: RegisterData): Promise<any> {
    try {
      console.log('📝 Tentando registrar novo usuário...');

      const response = await api.post('/auth/registro/', userData);

      console.log('✅ Usuário registrado com sucesso');
      return response.data;

    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      if (error.response?.status === 400) {
        throw error; // Propaga o erro para o componente tratar
      }
      throw new Error('Falha ao realizar cadastro. Tente novamente mais tarde.');
    }
  }

  /**
   * Atualiza o perfil do usuário.
   */
  async updateProfile(userData: UpdateProfileData) {
    // ✅ URL CORRETA JÁ ESTAVA SENDO USADA
    return await api.patch('/auth/perfil/', userData);
  }

  /**
   * Faz logout do usuário, limpando os tokens.
   */
  logout(): void {
    console.log('👋 Fazendo logout e limpando tokens...');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  /**
   * Verifica se há um token de acesso armazenado.
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Retorna o token de acesso.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}

// Exporta uma única instância da classe (Singleton Pattern)
const AuthService = new AuthServiceClass();
export default AuthService;
