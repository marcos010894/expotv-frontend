import './AnunciosPage.css';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import { useAnuncios } from '../hooks/useAnuncios';
import { type Anuncio } from '../services/api';

interface AnunciosPageProps {
  onRegister: () => void;
  onEdit: (anuncio: Anuncio) => void;
  onView: (anuncio: Anuncio) => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

const columns = [
  { key: 'id', title: 'ID', width: '60px' },
  { key: 'nome', title: 'Nome', width: '200px' },
  { key: 'nome_anunciante', title: 'Anunciante', width: '150px' },
  { key: 'numero_anunciante', title: 'Telefone', width: '130px' },
  { key: 'condominios_nomes', title: 'Condominios', width: '200px' },
  { key: 'status', title: 'Status', width: '100px' },
  { key: 'data_expiracao', title: 'Vencimento', width: '120px' }
];

export default function AnunciosPage({ onRegister, onEdit, onView, onNotification }: AnunciosPageProps) {
  const { anuncios, loading, error, deleteAnuncio, getCondominiosNames } = useAnuncios();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    anuncio: Anuncio | null;
  }>({
    isOpen: false,
    anuncio: null
  });

  const handleNewAnuncio = () => {
    onRegister();
  };

  // Processar dados para a tabela
  const anunciosData = anuncios.map(anuncio => {
    return {
      ...anuncio,
      condominios_nomes: getCondominiosNames(anuncio.condominios_ids),
      data_expiracao: new Date(anuncio.data_expiracao).toLocaleDateString('pt-BR'),
      status: anuncio.status === 'ativo' ? 'Ativo' : 'Inativo'
    };
  });

  // Filtrar anúncios baseado na pesquisa
  const filteredAnuncios = anunciosData.filter(anuncio => {
    const searchLower = searchTerm.toLowerCase();
    return (
      anuncio.nome.toLowerCase().includes(searchLower) ||
      anuncio.nome_anunciante.toLowerCase().includes(searchLower) ||
      anuncio.numero_anunciante.toLowerCase().includes(searchLower) ||
      anuncio.condominios_nomes.toLowerCase().includes(searchLower) ||
      anuncio.status.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (item: any) => {
    // Encontrar o anúncio original pelos dados processados
    const anuncio = anuncios.find(a => a.id === item.id);
    if (anuncio) {
      onEdit(anuncio);
    }
  };

  const handleView = (item: any) => {
    // Encontrar o anúncio original pelos dados processados
    const anuncio = anuncios.find(a => a.id === item.id);
    if (anuncio) {
      onView(anuncio);
    }
  };

  const handleDelete = (item: any) => {
    // Encontrar o anúncio original pelos dados processados
    const anuncio = anuncios.find(a => a.id === item.id);
    if (anuncio) {
      setDeleteModal({
        isOpen: true,
        anuncio: anuncio
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.anuncio) return;
    
    setDeleteLoading(true);
    try {
      await deleteAnuncio(deleteModal.anuncio.id);
      onNotification('success', `Anuncio "${deleteModal.anuncio.nome}" foi deletado com sucesso`);
      setDeleteModal({ isOpen: false, anuncio: null });
    } catch (error) {
      console.error('Erro ao deletar anúncio:', error);
      onNotification('error', 'Erro ao deletar anuncio. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, anuncio: null });
  };

  if (loading) {
    return (
      <main className="sindicos-page">
        <div className="page-card">
          <div className="loading">Carregando anuncios...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="sindicos-page">
        <div className="page-card">
          <div className="error">Erro: {error}</div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="sindicos-page">
        <div className="page-card">
          <div className="page-header">
            <h1 className="page-title">Anúncios</h1>
            <button className="new-btn" onClick={handleNewAnuncio}>
              <FiPlus className="btn-icon" />
              Novo Anúncio
            </button>
          </div>
          
          {/* Barra de Pesquisa */}
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por nome, anunciante, telefone, condomínio ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Limpar pesquisa"
              >
                ×
              </button>
            )}
          </div>

          {/* Contador de resultados */}
          {searchTerm && (
            <div className="search-results-count">
              {filteredAnuncios.length} {filteredAnuncios.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </div>
          )}
          
          {filteredAnuncios.length === 0 ? (
            <div className="empty-state">
              <p>{searchTerm ? 'Nenhum anúncio encontrado com esse filtro.' : 'Nenhum anúncio encontrado.'}</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredAnuncios}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Deletar Anuncio"
        message={`Tem certeza que deseja deletar o anuncio "${deleteModal.anuncio?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText={deleteLoading ? "Deletando..." : "Deletar"}
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
