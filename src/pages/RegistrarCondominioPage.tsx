import { useState } from 'react';
import './RegistrarCondominioPage.css';
import { FiArrowLeft } from 'react-icons/fi';
import { useCondominios } from '../hooks/useCondominios';
import { cepService } from '../services/api';

interface RegistrarCondominioPageProps {
  onBack: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

interface FormData {
  nome: string;
  sindico_id: number;
  cep: string;
  localizacao: string;
}

export default function RegistrarCondominioPage({ onBack, onSuccess, onError }: RegistrarCondominioPageProps) {
  const { sindicos, createCondominio } = useCondominios();
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    sindico_id: 0,
    cep: '',
    localizacao: ''
  });
  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sindico_id' ? Number(value) : value
    }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep }));

    if (cep.length === 8) {
      setBuscandoCep(true);
      try {
        const dadosCep = await cepService.buscarCep(cep);
        setFormData(prev => ({
          ...prev,
          localizacao: `${dadosCep.localidade}, ${dadosCep.uf}`
        }));
      } catch (error) {
        onError('CEP não encontrado');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.sindico_id || !formData.cep || !formData.localizacao) {
      onError('Todos os campos são obrigatórios');
      return;
    }

    if (formData.cep.length !== 8) {
      onError('CEP deve ter 8 dígitos');
      return;
    }

    setLoading(true);
    try {
      await createCondominio({
        nome: formData.nome,
        sindico_id: formData.sindico_id,
        cep: formData.cep,
        localizacao: formData.localizacao
      });
      onSuccess('Condominio registrado com sucesso!');
      onBack();
    } catch (error) {
      console.error('Erro ao registrar condominio:', error);
      onError('Erro ao registrar condominio. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCep = (value: string) => {
    return value.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <main className="sindicos-page">
      <div className="page-card">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <FiArrowLeft />
            Voltar
          </button>
          <h1 className="page-title">Registrar Condomínio</h1>
          <div></div>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome do Condomínio *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite o nome do condominio"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sindico_id">Síndico Responsável *</label>
              <select
                id="sindico_id"
                name="sindico_id"
                value={formData.sindico_id}
                onChange={handleChange}
                required
              >
                <option value={0}>Selecione um síndico</option>
                {sindicos.map(sindico => (
                  <option key={sindico.id} value={sindico.id}>
                    {sindico.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="cep">CEP *</label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={formatCep(formData.cep)}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength={9}
                required
              />
              {buscandoCep && <small className="loading-text">Buscando CEP...</small>}
            </div>

            <div className="form-group">
              <label htmlFor="localizacao">Localização *</label>
              <input
                type="text"
                id="localizacao"
                name="localizacao"
                value={formData.localizacao}
                onChange={handleChange}
                placeholder="Cidade, Estado"
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
              disabled={loading || buscandoCep}
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
