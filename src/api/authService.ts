import api from './config';

// Interface para login
interface LoginCredentials {
  username: string;
  password: string;
}

// Interface para resposta do token
interface TokenResponse {
  access: string;
  refresh: string;
}

// Interface para registro
interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;  // Confirmação de senha
  nickname: string;
  first_name?: string;
  last_name?: string;
  data_nascimento?: string;
}

// Interface para atualização de perfil
interface UpdateProfileData {
  email?: string;
  first_name?: string;
  last_name?: string;
  data_nascimento?: string;
}

// Interface para solicitação de redefinição de senha
interface PasswordResetRequest {
  email: string;
}

// Interface para confirmação de redefinição de senha
interface PasswordResetConfirm {
  password: string;
  password2: string;
  token: string;
  uidb64: string;
}

export const AuthService = {
  // Login do usuário
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/token/', credentials);

    // Armazena os tokens no localStorage
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);

    return response.data;
  },

  // Registro de novo usuário
  async register(userData: RegisterData) {
    return await api.post('/auth/registro/', userData);
  },

  // Logout do usuário
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Obter perfil do usuário
  async getProfile() {
    return await api.get('/auth/perfil/');
  },

  // Atualizar perfil do usuário - CORRIGIDO: PATCH em vez de PUT
  async updateProfile(userData: UpdateProfileData) {
    return await api.patch('/auth/perfil/', userData);
  },

  // Solicitar redefinição de senha
  async requestPasswordReset(data: PasswordResetRequest) {
    return await api.post('/auth/password-reset/', data);
  },

  // Confirmar redefinição de senha
  async confirmPasswordReset(data: PasswordResetConfirm) {
    return await api.post('/auth/password-reset/confirm/', data);
  }
};

export default AuthService;