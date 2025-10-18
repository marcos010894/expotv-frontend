import { useState } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import './LoginPage.css';
import { authService, type LoginRequest } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onError: (message: string) => void;
}

export default function LoginPage({ onLoginSuccess, onError }: LoginPageProps) {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.senha.trim()) {
      onError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authService.login(formData);
      console.log('Login realizado com sucesso:', response);
      onLoginSuccess();
    } catch (error: any) {
      console.error('Erro no login:', error);
      if (error.response?.status === 401) {
        onError('Email ou senha incorretos.');
      } else if (error.response?.status === 422) {
        onError('Dados inválidos. Verifique o formato do email.');
      } else {
        onError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <FiLogIn />
            </div>
            <h1 className="login-title">Expo TV</h1>
            <p className="login-subtitle">Faça login para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Seu email"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Sua senha"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading || !formData.email.trim() || !formData.senha.trim()}
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <FiLogIn />
                  Entrar
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Sistema de Gestão de Anúncios para Condomínios</p>
          </div>
        </div>
      </div>
    </div>
  );
}
