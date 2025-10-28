import { useState, useEffect } from 'react';
import './EditarAvisoPage.css';
import { FiArrowLeft } from 'react-icons/fi';
import { useAvisos } from '../hooks/useAvisos';
import ImageUpload from '../components/ImageUpload';
import { authService } from '../services/api';

interface EditarAvisoPageProps {
  avisoId: number;
  onBack: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

interface FormData {
  nome: string;
  condominios_ids: number[];
  status: string;
  data_expiracao: string;
  mensagem: string;
  image?: File;
  video?: File;
  mediaType: 'image' | 'video';
  contentType: 'texto' | 'midia'; // Nova propriedade para o toggle
}

export default function EditarAvisoPage({ avisoId, onBack, onSuccess, onError }: EditarAvisoPageProps) {
  const { avisos, updateAviso } = useAvisos();
  const condominios = authService.getUserCondominios();
  
  // Função para calcular o status baseado na data
  const getStatusFromDate = (dataExpiracao: string): string => {
    if (!dataExpiracao) return 'ativo';
    
    const dataExp = new Date(dataExpiracao);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataExp.setHours(0, 0, 0, 0);
    
    return dataExp >= hoje ? 'ativo' : 'inativo';
  };
  
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    condominios_ids: [],
    status: 'ativo',
    data_expiracao: '',
    mensagem: '',
    image: undefined,
    video: undefined,
    mediaType: 'image',
    contentType: 'texto'
  });
  const [loading, setLoading] = useState(false);
  const [loadingAviso, setLoadingAviso] = useState(true);

  // Carregar dados do aviso
  useEffect(() => {
    const aviso = avisos.find(a => a.id === avisoId);
    if (aviso) {
      const dataExpiracao = aviso.data_expiracao ? new Date(aviso.data_expiracao).toISOString().slice(0, 16) : '';
      const hasMedia = (aviso as any).archive_url && (aviso as any).archive_url.trim() !== '';
      const hasMensagem = aviso.mensagem && aviso.mensagem.trim() !== '';
      
      setFormData({
        nome: aviso.nome,
        condominios_ids: aviso.condominios_ids.split(',').map(id => parseInt(id.trim())),
        status: dataExpiracao ? getStatusFromDate(dataExpiracao) : aviso.status,
        data_expiracao: dataExpiracao,
        mensagem: aviso.mensagem,
        image: undefined,
        video: undefined,
        mediaType: aviso.video ? 'video' : 'image',
        contentType: hasMedia ? 'midia' : 'texto' // Define baseado no que já existe
      });
      setLoadingAviso(false);
    }
  }, [avisos, avisoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: value
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
    const allIds = condominios.map((c: any) => c.id);
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

  const handleImageSelect = (file: File | null) => {
    if (file) {
      const isVideo = file.type.startsWith('video/');
      setFormData(prev => ({
        ...prev,
        image: isVideo ? undefined : file,
        video: isVideo ? file : undefined,
        mediaType: isVideo ? 'video' : 'image'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        image: undefined,
        video: undefined
      }));
    }
  };

  const handleContentTypeChange = (type: 'texto' | 'midia') => {
    setFormData(prev => ({
      ...prev,
      contentType: type,
      // Limpar campos ao trocar de tipo
      mensagem: type === 'midia' ? '' : prev.mensagem,
      image: type === 'texto' ? undefined : prev.image,
      video: type === 'texto' ? undefined : prev.video
    }));
  };

  const setExpirationDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const formattedDate = date.toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      data_expiracao: formattedDate
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || 
        formData.condominios_ids.length === 0 || !formData.status) {
      onError('Preencha todos os campos obrigatórios');
      return;
    }

    // Validar se a data de expiração não está no passado (se informada)
    if (formData.data_expiracao) {
      const dataExpiracao = new Date(formData.data_expiracao);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataExpiracao.setHours(0, 0, 0, 0);
      
      if (dataExpiracao < hoje) {
        onError('A data de expiração não pode ser anterior à data atual');
        return;
      }
    }

    setLoading(true);
    
    try {
      await updateAviso(avisoId, {
        nome: formData.nome,
        condominios_ids: formData.condominios_ids.join(','),
        sindico_ids: authService.getUserData().id || '1',
        mensagem: formData.mensagem,
        numero_anunciante: '',
        nome_anunciante: '',
        status: formData.status,
        data_expiracao: formData.data_expiracao || undefined,
        sindico_id: parseInt(authService.getUserData().id || '1'),
        condominio_id: formData.condominios_ids[0],
        image: formData.image,
        video: formData.video
      });
      
      onSuccess('Aviso atualizado com sucesso!');
      onBack();
    } catch (error) {
      console.error('Erro ao atualizar aviso:', error);
      onError('Erro ao atualizar aviso. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingAviso) {
    return (
      <main className="sindicos-page">
        <div className="page-card">
          <div className="loading">Carregando aviso...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="sindicos-page">
      <div className="page-card">
        <div className="page-header">
          <button className="back-btn" onClick={onBack}>
            <FiArrowLeft />
            Voltar
          </button>
          <h1 className="page-title">Editar Aviso</h1>
          <div></div>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome/Título *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Digite o nome/título do aviso"
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
                <option value="expirado">Expirado</option>
              </select>
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                {formData.data_expiracao 
                  ? `Status definido automaticamente pela data de expiração (${formData.status === 'ativo' ? 'Data válida' : 'Data vencida'})`
                  : 'O status será definido automaticamente baseado na data de expiração'}
              </small>
            </div>
          </div>

          {/* Toggle de Tipo de Conteúdo */}
          <div className="form-group">
            <label>Tipo de Conteúdo *</label>
            <div className="content-type-toggle">
              <div className="content-type-option">
                <input
                  type="radio"
                  id="contentType-texto"
                  name="contentType"
                  value="texto"
                  checked={formData.contentType === 'texto'}
                  onChange={() => handleContentTypeChange('texto')}
                />
                <label htmlFor="contentType-texto" className="content-type-label">
                  <span className="emoji">📝</span>
                  <span>Texto</span>
                </label>
              </div>
              
              <div className="content-type-option">
                <input
                  type="radio"
                  id="contentType-midia"
                  name="contentType"
                  value="midia"
                  checked={formData.contentType === 'midia'}
                  onChange={() => handleContentTypeChange('midia')}
                />
                <label htmlFor="contentType-midia" className="content-type-label">
                  <span className="emoji">🎬</span>
                  <span>Imagem/Vídeo</span>
                </label>
              </div>
            </div>
            <small className="content-type-hint">
              {formData.contentType === 'texto' 
                ? '✓ Modo texto ativo - Campo de mídia bloqueado' 
                : '✓ Modo mídia ativo - Campo de mensagem bloqueado'}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="mensagem">Mensagem</label>
            <textarea
              id="mensagem"
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              placeholder={formData.contentType === 'texto' ? "Digite a mensagem completa do aviso" : "Campo bloqueado - Modo imagem/vídeo selecionado"}
              rows={6}
              disabled={formData.contentType === 'midia'}
              style={formData.contentType === 'midia' ? {
                backgroundColor: '#f5f5f5',
                cursor: 'not-allowed',
                color: '#999'
              } : {}}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="data_expiracao">Data de Expiração</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setExpirationDate(7)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  +7 dias
                </button>
                <button
                  type="button"
                  onClick={() => setExpirationDate(15)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  +15 dias
                </button>
                <button
                  type="button"
                  onClick={() => setExpirationDate(30)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.75rem',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  +30 dias
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              id="data_expiracao"
              name="data_expiracao"
              value={formData.data_expiracao}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              A data deve ser igual ou posterior à data atual
            </small>
          </div>

          <div className="form-group image-upload-group">
            <label>Imagem/Vídeo do Aviso</label>
            {formData.contentType === 'texto' ? (
              <div style={{
                padding: '2rem',
                backgroundColor: '#f5f5f5',
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#999'
              }}>
                <p>🔒 Upload bloqueado</p>
                <small>Selecione "Imagem/Vídeo" no tipo de conteúdo para habilitar</small>
              </div>
            ) : (
              <ImageUpload 
                onImageSelect={handleImageSelect}
                value={formData.image}
                placeholder="Clique para selecionar uma nova imagem/vídeo para o aviso ou arraste aqui"
                allowVideo={true}
              />
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label>Condomínios * (selecione pelo menos um)</label>
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
              {condominios.map((condominio: any) => (
                <label key={condominio.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.condominios_ids.includes(condominio.id)}
                    onChange={(e) => handleCondominiumChange(condominio.id, e.target.checked)}
                  />
                  <span className="checkbox-text">
                    <strong>{condominio.nome}</strong>
                    <small>{condominio.localizacao}</small>
                  </span>
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
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
