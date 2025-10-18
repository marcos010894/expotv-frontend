import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Configuração do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interfaces TypeScript
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  user_name: string;
  user_type: 'ADM' | 'sindico';
  url_photo: string | null;
  condominios_ids: number[];
  condominios: {
    id: number;
    nome: string;
    localizacao: string;
    cep: string;
  }[];
}

export interface User {
  id: number;
  nome: string;
  tipo: 'ADM' | 'sindico';
  email: string;
  telefone?: string;
  senha: string;
  data_criacao: string;
  data_update?: string;
  token?: string;
  limite_avisos?: number;
}

export interface Condominio {
  id: number;
  nome: string;
  sindico_id: number;
  cep: string;
  localizacao: string;
  data_registro: string;
}

export interface TV {
  id: number;
  codigo_conexao: string;
  template: string;
  nome: string;
  condominio_id: number;
  status: 'online' | 'offline';
  data_registro: string;
}

export interface Anuncio {
  id: number;
  nome_anunciante: string;
  numero_anunciante: string;
  data_expiracao: string;
  nome: string;
  condominios_ids: string;
  status: 'ativo' | 'inativo';
  archive_url: string;
  tempo_exibicao?: number;
}

export interface Aviso {
  id: number;
  nome: string;
  condominios_ids: string;
  sindico_ids: string;
  numero_anunciante?: string;
  nome_anunciante?: string;
  status: string;
  data_expiracao?: string;
  mensagem: string;
  image?: string | null;
  video?: string | null;
  sindico_id: number;
  condominio_id: number;
  data_criacao: string;
}

export interface CondominioDetalhado {
  condominio: Condominio;
  sindico: User;
  tvs: TV[];
  anuncios: Anuncio[];
}

// Serviços da API
// Serviço de Autenticação
export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/login', credentials);
      
      // Armazenar token no localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user_id', response.data.user_id.toString());
        localStorage.setItem('user_name', response.data.user_name);
        localStorage.setItem('user_type', response.data.user_type);
        localStorage.setItem('url_photo', response.data.url_photo || '');
        localStorage.setItem('condominios_ids', JSON.stringify(response.data.condominios_ids));
        localStorage.setItem('condominios', JSON.stringify(response.data.condominios));
        
        // Configurar header de autenticação para próximas requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  },

    // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_type');
    localStorage.removeItem('url_photo');
    localStorage.removeItem('condominios_ids');
    localStorage.removeItem('condominios');
    delete api.defaults.headers.common['Authorization'];
  },

  // Verificar se está autenticado
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  // Obter token
  getToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

    // Obter dados do usuário do localStorage
  getUserData: () => {
    return {
      id: localStorage.getItem('user_id'),
      name: localStorage.getItem('user_name'),
      type: localStorage.getItem('user_type'),
      foto: localStorage.getItem('url_photo'),
    };
  },

  // Obter condomínios do usuário
  getUserCondominios: () => {
    try {
      const condominios = localStorage.getItem('condominios');
      return condominios ? JSON.parse(condominios) : [];
    } catch (error) {
      console.error('Erro ao obter condomínios do usuário:', error);
      return [];
    }
  },

  // Inicializar autenticação (para usar na inicialização da app)
  initializeAuth: () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  // Upload de foto do usuário
  uploadUserPhoto: async (userId: string, photo: File): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('foto', photo);

      await api.put(`/users/${userId}/foto`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      throw error;
    }
  },

  // Atualizar dados do usuário no localStorage
  updateUserData: (newData: Partial<{id: string; name: string; type: string; foto: string}>) => {
    if (newData.id) localStorage.setItem('user_id', newData.id);
    if (newData.name) localStorage.setItem('user_name', newData.name);
    if (newData.type) localStorage.setItem('user_type', newData.type);
    if (newData.foto !== undefined) localStorage.setItem('url_photo', newData.foto);
  }
};

export const userService = {
  // Buscar todos os usuários
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/users/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  // Buscar usuário por ID
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  },

  // Criar novo usuário
  createUser: async (userData: Omit<User, 'id' | 'data_criacao' | 'data_update' | 'token'>): Promise<User> => {
    try {
      const response = await api.post<User>('/users/', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  // Atualizar usuário
  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      // Construir o corpo da requisição com todos os campos necessários
      const requestBody = {
        id: id,
        tipo: userData.tipo || 'sindico',
        nome: userData.nome || '',
        email: userData.email || '',
        senha: userData.senha || '',
        token: userData.token || '',
        data_criacao: userData.data_criacao || new Date().toISOString(),
        data_update: new Date().toISOString(),
        telefone: userData.telefone || '',
        limite_avisos: userData.limite_avisos || 10
      };

      console.log('Enviando para API PUT /users/' + id + ':', JSON.stringify(requestBody, null, 2));

      const response = await api.put<User>(`/users/${id}`, requestBody);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  // Deletar usuário
  deleteUser: async (id: number): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  },

  // Trocar senha do usuário
  changePassword: async (userId: number, senhaAtual: string, senhaNova: string): Promise<void> => {
    try {
      await api.put(`/users/${userId}/senha`, {
        senha_atual: senhaAtual,
        senha_nova: senhaNova
      });
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      throw error;
    }
  },
};

// Serviços para Condominios
export const condominioService = {
  // Buscar todos os condominios
  getCondominios: async (): Promise<Condominio[]> => {
    try {
      const response = await api.get<Condominio[]>('/condominios');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar condominios:', error);
      throw error;
    }
  },

  // Buscar condominio por ID com detalhes
  getCondominioById: async (id: number): Promise<CondominioDetalhado> => {
    try {
      const response = await api.get<CondominioDetalhado>(`/condominios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar condominio:', error);
      throw error;
    }
  },

  // Criar novo condominio
  createCondominio: async (condominioData: Omit<Condominio, 'id' | 'data_registro'>): Promise<Condominio> => {
    try {
      const requestBody = {
        ...condominioData,
        data_registro: new Date().toISOString()
      };
      const response = await api.post<Condominio>('/condominios', requestBody);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar condominio:', error);
      throw error;
    }
  },

  // Atualizar condominio
  updateCondominio: async (id: number, condominioData: Partial<Condominio>): Promise<Condominio> => {
    try {
      const response = await api.put<Condominio>(`/condominios/${id}`, condominioData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar condominio:', error);
      throw error;
    }
  },

  // Deletar condominio
  deleteCondominio: async (id: number): Promise<void> => {
    try {
      await api.delete(`/condominios/${id}`);
    } catch (error) {
      console.error('Erro ao deletar condominio:', error);
      throw error;
    }
  },
};

// Serviços de TV
export const tvService = {
  // Buscar todas as TVs
  getTVs: async (): Promise<TV[]> => {
    try {
      const response = await api.get<TV[]>('/tvs');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar TVs:', error);
      throw error;
    }
  },

  // Buscar TV por ID
  getTVById: async (id: number): Promise<TV> => {
    try {
      const response = await api.get<TV>(`/tvs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar TV:', error);
      throw error;
    }
  },

  // Criar nova TV
  createTV: async (tvData: Omit<TV, 'id' | 'data_registro'>): Promise<TV> => {
    try {
      const requestBody = {
        ...tvData,
        data_registro: new Date().toISOString()
      };
      const response = await api.post<TV>('/tvs', requestBody);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar TV:', error);
      throw error;
    }
  },

  // Atualizar TV
  updateTV: async (id: number, tvData: Partial<TV>): Promise<TV> => {
    try {
      const response = await api.put<TV>(`/tvs/${id}`, tvData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar TV:', error);
      throw error;
    }
  },

  // Deletar TV
  deleteTV: async (id: number): Promise<void> => {
    try {
      await api.delete(`/tvs/${id}`);
    } catch (error) {
      console.error('Erro ao deletar TV:', error);
      throw error;
    }
  },
};

// Serviços de Anúncios
export const anuncioService = {
  // Buscar todos os anúncios
  getAnuncios: async (): Promise<Anuncio[]> => {
    try {
      const response = await api.get<Anuncio[]>('/anuncios');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar anúncios:', error);
      throw error;
    }
  },

  // Buscar anúncio por ID
  getAnuncioById: async (id: number): Promise<Anuncio> => {
    try {
      const response = await api.get<Anuncio>(`/anuncios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar anúncio:', error);
      throw error;
    }
  },

  // Criar novo anúncio
  createAnuncio: async (anuncioData: Omit<Anuncio, 'id'> & { image?: File }): Promise<Anuncio> => {
    try {
      const formData = new FormData();
      
      formData.append('nome', anuncioData.nome);
      formData.append('nome_anunciante', anuncioData.nome_anunciante);
      formData.append('numero_anunciante', anuncioData.numero_anunciante);
      formData.append('condominios_ids', anuncioData.condominios_ids);
      formData.append('data_expiracao', anuncioData.data_expiracao);
      formData.append('status', anuncioData.status);
      
      if (anuncioData.archive_url) {
        formData.append('archive_url', anuncioData.archive_url);
      }
      
      if (anuncioData.image) {
        formData.append('image', anuncioData.image);
      }

      const response = await api.post<Anuncio>('/anuncios/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar anúncio:', error);
      throw error;
    }
  },

  // Atualizar anúncio
  updateAnuncio: async (id: number, anuncioData: Partial<Anuncio>): Promise<Anuncio> => {
    try {
      const response = await api.put<Anuncio>(`/anuncios/${id}`, anuncioData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar anúncio:', error);
      throw error;
    }
  },

  // Deletar anúncio
  deleteAnuncio: async (id: number): Promise<void> => {
    try {
      await api.delete(`/anuncios/${id}`);
    } catch (error) {
      console.error('Erro ao deletar anúncio:', error);
      throw error;
    }
  },
};

// Serviço de Avisos (para síndicos)
export const avisoService = {
  // Buscar todos os avisos
  getAll: async (): Promise<Aviso[]> => {
    try {
      const response = await api.get<Aviso[]>('/avisos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar avisos:', error);
      throw error;
    }
  },

  // Buscar aviso por ID
  getById: async (id: number): Promise<Aviso> => {
    try {
      const response = await api.get<Aviso>(`/avisos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar aviso:', error);
      throw error;
    }
  },

  // Buscar avisos por síndico ID
  getBySindico: async (sindicoId: number): Promise<Aviso[]> => {
    try {
      const response = await api.get<Aviso[]>(`/avisos/sindico/${sindicoId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar avisos do síndico:', error);
      throw error;
    }
  },

  // Criar novo aviso
  create: async (avisoData: Omit<Aviso, 'id' | 'data_criacao' | 'image' | 'video'> & { image?: File; video?: File }): Promise<Aviso> => {
    try {
      const formData = new FormData();
      
      formData.append('nome', avisoData.nome);
      formData.append('condominios_ids', avisoData.condominios_ids);
      formData.append('sindico_ids', avisoData.sindico_ids);
      formData.append('mensagem', avisoData.mensagem);
      formData.append('status', avisoData.status);
      formData.append('sindico_id', avisoData.sindico_id.toString());
      formData.append('condominio_id', avisoData.condominio_id.toString());
      
      if (avisoData.numero_anunciante) {
        formData.append('numero_anunciante', avisoData.numero_anunciante);
      }
      
      if (avisoData.nome_anunciante) {
        formData.append('nome_anunciante', avisoData.nome_anunciante);
      }
      
      if (avisoData.data_expiracao) {
        formData.append('data_expiracao', avisoData.data_expiracao);
      }
      
      if (avisoData.image) {
        formData.append('image', avisoData.image);
      }

      if (avisoData.video) {
        formData.append('video', avisoData.video);
      }

      const response = await api.post<Aviso>('/avisos/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar aviso:', error);
      throw error;
    }
  },

  // Atualizar aviso
  update: async (id: number, avisoData: Partial<Omit<Aviso, 'image' | 'video'>> & { image?: File; video?: File }): Promise<Aviso> => {
    try {
      const formData = new FormData();
      
      if (avisoData.nome) formData.append('nome', avisoData.nome);
      if (avisoData.condominios_ids) formData.append('condominios_ids', avisoData.condominios_ids);
      if (avisoData.sindico_ids) formData.append('sindico_ids', avisoData.sindico_ids);
      if (avisoData.mensagem) formData.append('mensagem', avisoData.mensagem);
      if (avisoData.status) formData.append('status', avisoData.status);
      if (avisoData.sindico_id) formData.append('sindico_id', avisoData.sindico_id.toString());
      if (avisoData.condominio_id) formData.append('condominio_id', avisoData.condominio_id.toString());
      
      if (avisoData.numero_anunciante !== undefined) {
        formData.append('numero_anunciante', avisoData.numero_anunciante || '');
      }
      
      if (avisoData.nome_anunciante !== undefined) {
        formData.append('nome_anunciante', avisoData.nome_anunciante || '');
      }
      
      if (avisoData.data_expiracao !== undefined) {
        formData.append('data_expiracao', avisoData.data_expiracao || '');
      }
      
      if (avisoData.image) {
        formData.append('image', avisoData.image);
      }

      if (avisoData.video) {
        formData.append('video', avisoData.video);
      }

      const response = await api.put<Aviso>(`/avisos/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar aviso:', error);
      throw error;
    }
  },

  // Deletar aviso
  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/avisos/${id}`);
    } catch (error) {
      console.error('Erro ao deletar aviso:', error);
      throw error;
    }
  },
};

// Serviço para buscar dados do CEP
export const cepService = {
  buscarCep: async (cep: string): Promise<{ logradouro: string; localidade: string; uf: string }> => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }
      
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      return {
        logradouro: data.logradouro || '',
        localidade: data.localidade || '',
        uf: data.uf || ''
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw error;
    }
  }
};

export default api;
