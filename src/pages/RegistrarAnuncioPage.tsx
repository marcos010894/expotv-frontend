import { useState } from 'react';
import './RegistrarAnuncioPage.css';
import { FiArrowLeft } from 'react-icons/fi';
import { useAnuncios } from '../hooks/useAnuncios';
import { useCondominios } from '../hooks/useCondominios';
import ImageUpload from '../components/ImageUpload';

interface RegistrarAnuncioPageProps {
  onBack: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

interface FormData {
  nome: string;
  nome_anunciante: string;
  numero_anunciante: string;
  condominios_ids: number[];
  data_expiracao: string;
  status: 'ativo' | 'inativo';
  archive_url: string;
  tempo_exibicao: number;
  image?: File;
}

export default function RegistrarAnuncioPage({ onBack, onSuccess, onError }: RegistrarAnuncioPageProps) {
  const { createAnuncio } = useAnuncios();
  const { condominios } = useCondominios();
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    nome_anunciante: '',
    numero_anunciante: '',
    condominios_ids: [],
    data_expiracao: '',
    status: 'ativo',
    archive_url: '',
    tempo_exibicao: 10,
  });
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file || undefined
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tempo_exibicao' ? Number(value) : value
    }));
  };

  const handleCondominiumChange = (condominiumId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        condominios_ids: [...prev.condominios_ids, condominiumId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        condominios_ids: prev.condominios_ids.filter(id => id !== condominiumId)
      }));
    }
  };

  const handleSelectAllCondominios = () => {
    const allIds = condominios.map(c => c.id);
    setFormData(prev => ({
      ...prev,
      condominios_ids: allIds
    }));
  };

  const handleDeselectAllCondominios = () => {
    setFormData(prev => ({
      ...prev,
      condominios_ids: []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.nome_anunciante.trim() || 
        !formData.numero_anunciante.trim() || formData.condominios_ids.length === 0 ||
        !formData.data_expiracao) {
      onError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      await createAnuncio({
        nome: formData.nome,
        nome_anunciante: formData.nome_anunciante,
        numero_anunciante: formData.numero_anunciante,
        condominios_ids: formData.condominios_ids.join(','),
        data_expiracao: formData.data_expiracao,
        status: formData.status,
        archive_url: formData.archive_url,
        tempo_exibicao: formData.tempo_exibicao,
        image: formData.image
      });
      
      onSuccess('Anuncio criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar anuncio:', error);
      onError('Erro ao criar anuncio. Tente novamente.');
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
          <h1 className="page-title">Cadastrar Novo Anuncio</h1>
          <div></div>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome do Anuncio *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite o nome do anuncio"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome_anunciante">Nome do Anunciante *</label>
              <input
                type="text"
                id="nome_anunciante"
                name="nome_anunciante"
                value={formData.nome_anunciante}
                onChange={handleChange}
                placeholder="Digite o nome do anunciante"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="numero_anunciante">Telefone do Anunciante *</label>
              <input
                type="tel"
                id="numero_anunciante"
                name="numero_anunciante"
                value={formData.numero_anunciante}
                onChange={handleChange}
                placeholder="Digite o telefone"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="data_expiracao">Data de Expiracao *</label>
              <input
                type="date"
                id="data_expiracao"
                name="data_expiracao"
                value={formData.data_expiracao}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tempo_exibicao">Tempo de Exibição (segundos) *</label>
              <input
                type="number"
                id="tempo_exibicao"
                name="tempo_exibicao"
                value={formData.tempo_exibicao}
                onChange={handleChange}
                placeholder="Digite o tempo em segundos"
                min={1}
                required
              />
            </div>
          </div>

          <div className="form-group image-upload-group">
            <label>Imagem do Anúncio</label>
            <ImageUpload 
              onImageSelect={handleImageSelect}
              value={formData.image}
              placeholder="Clique para selecionar uma imagem para o anúncio ou arraste aqui"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label>Condominios * (selecione pelo menos um)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleSelectAllCondominios}
                  className="btn-select-all"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                >
                  Selecionar Todos
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllCondominios}
                  className="btn-deselect-all"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.85rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
                >
                  Limpar Seleção
                </button>
              </div>
            </div>
            <div className="condominiums-grid">
              {condominios.map((condominio) => (
                <label key={condominio.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.condominios_ids.includes(condominio.id)}
                    onChange={(e) => handleCondominiumChange(condominio.id, e.target.checked)}
                  />
                  <span>{condominio.nome}</span>
                </label>
              ))}
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
