import { useState } from 'react';
import './RegistrarAnuncioPage.css';
import { FiArrowLeft, FiEye } from 'react-icons/fi';
import { useAnuncios } from '../hooks/useAnuncios';
import { useCondominios } from '../hooks/useCondominios';
import ImageUpload from '../components/ImageUpload';
import AnuncioPreviewModal from '../components/AnuncioPreviewModal';

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
  
  // Função para calcular o status baseado na data
  const getStatusFromDate = (dataExpiracao: string): 'ativo' | 'inativo' => {
    if (!dataExpiracao) return 'ativo';
    
    const dataExp = new Date(dataExpiracao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataExp.setHours(0, 0, 0, 0);
    
    return dataExp >= hoje ? 'ativo' : 'inativo';
  };
  
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
  const [showPreview, setShowPreview] = useState(false);

  const handleImageSelect = (file: File | null) => {
    setFormData(prev => ({
      ...prev,
      image: file || undefined
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: name === 'tempo_exibicao' ? Number(value) : value
      };
      
      // Atualizar status automaticamente baseado na data de expiração
      if (name === 'data_expiracao' && value) {
        const dataExpiracao = new Date(value);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataExpiracao.setHours(0, 0, 0, 0);
        
        updated.status = dataExpiracao >= hoje ? 'ativo' : 'inativo';
      }
      
      return updated;
    });
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

    // Validar se a data de expiração não está no passado
    const dataExpiracao = new Date(formData.data_expiracao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataExpiracao.setHours(0, 0, 0, 0);
    
    if (dataExpiracao < hoje) {
      onError('A data de expiração não pode ser anterior à data atual');
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
          <h1 className="page-title">Cadastrar Novo Anúncio</h1>
          <div></div>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome do Anúncio *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite o nome do anúncio"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled
                style={{ 
                  backgroundColor: '#f5f5f5', 
                  cursor: 'not-allowed',
                  color: '#666'
                }}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {formData.data_expiracao 
                  ? `Status definido automaticamente pela data de expiração (${formData.status === 'ativo' ? 'Data válida' : 'Data vencida'})`
                  : 'O status será definido automaticamente baseado na data de expiração'}
              </small>
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
              <label htmlFor="data_expiracao">Data de Expiração *</label>
              <input
                type="date"
                id="data_expiracao"
                name="data_expiracao"
                value={formData.data_expiracao}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                A data deve ser igual ou posterior à data atual
              </small>
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
              placeholder="Clique para selecionar uma imagem para o anúncio (GIF, JPG, PNG, JPEG, WEBP)"
              accept=".gif,.jpg,.jpeg,.png,.webp,image/gif,image/jpeg,image/png,image/webp"
              allowVideo={false}
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
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn btn-info"
              disabled={!formData.image}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiEye size={18} />
              Pré-visualizar
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
      
      {/* Modal de Preview */}
      <AnuncioPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        imageUrl={formData.image ? URL.createObjectURL(formData.image) : undefined}
        nome={formData.nome || 'Anúncio sem nome'}
        fileType={formData.image?.type}
      />
    </main>
  );
}
