import { useState } from 'react';
import './RegistrarSindicoPage.css';
import { FiArrowLeft } from 'react-icons/fi';
import { userService } from '../services/api';

interface RegistrarSindicoPageProps {
  onBack: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

interface FormData {
  tipo: 'sindico' | 'ADM';
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  limite_avisos: number;
}

export default function RegistrarSindicoPage({ onBack, onSuccess, onError }: RegistrarSindicoPageProps) {
  const [formData, setFormData] = useState<FormData>({
    tipo: 'sindico',
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    limite_avisos: 10
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'limite_avisos' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.email || !formData.senha || !formData.telefone) {
      onError('Todos os campos são obrigatórios');
      return;
    }

    if (formData.senha.length < 6) {
      onError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await userService.createUser({
        ...formData
      });
      onSuccess(`${formData.tipo === 'sindico' ? 'Síndico' : 'Administrador'} registrado com sucesso!`);
      onBack();
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      onError('Erro ao registrar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="sindicos-page">
      <div className="page-card">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <FiArrowLeft />
            Voltar
          </button>
          <h1 className="page-title">Registrar Usuário</h1>
          <div></div>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo">Tipo de Usuário *</label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="sindico">Síndico</option>
                <option value="ADM">Administrador</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nome">Nome Completo *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite o nome completo"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite o email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone *</label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senha">Senha *</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Digite a senha"
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="limite_avisos">Limite de Avisos *</label>
              <input
                type="number"
                id="limite_avisos"
                name="limite_avisos"
                value={formData.limite_avisos}
                onChange={handleChange}
                placeholder="Digite o limite de avisos"
                min={1}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onBack}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
