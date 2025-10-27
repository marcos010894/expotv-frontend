import './CondominiosPage.css';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import { useCondominios } from '../hooks/useCondominios';
import { type Condominio } from '../services/api';

interface CondominiosPageProps {
  onRegister: () => void;
  onEdit: (condominio: Condominio) => void;
  onView: (condominio: Condominio) => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

const columns = [
  { key: 'id', title: 'ID', width: '60px' },
  { key: 'nome', title: 'Nome', width: '180px' },
  { key: 'localizacao', title: 'Localização', width: '150px' },
  { key: 'cep', title: 'CEP', width: '100px' },
  { key: 'sindico_nome', title: 'Síndico', width: '140px' },
  { key: 'qtd_tvs', title: 'TVs', width: '70px' },
  { key: 'qtd_anuncios', title: 'Anúncios', width: '90px' },
  { key: 'data_registro', title: 'Data Registro', width: '120px' }
];

export default function CondominiosPage({ onRegister, onEdit, onView, onNotification }: CondominiosPageProps) {
  const { condominios, sindicos, tvs, anuncios, loading, error, deleteCondominio } = useCondominios();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    condominio: Condominio | null;
  }>({
    isOpen: false,
    condominio: null
  });

  // Mapear dados dos condominios com nome do síndico e contagens
  const condominiosData = condominios.map(condominio => {
    const sindico = sindicos.find(s => s.id === condominio.sindico_id);
    
    // Contar TVs do condomínio
    const qtd_tvs = tvs.filter(tv => tv.condominio_id === condominio.id).length;
    
    // Contar anúncios do condomínio
    const qtd_anuncios = anuncios.filter(anuncio => {
      const condominiosIds = anuncio.condominios_ids.split(',').map(id => parseInt(id.trim()));
      return condominiosIds.includes(condominio.id);
    }).length;
    
    return {
      ...condominio,
      sindico_nome: sindico?.nome || 'N/A',
      qtd_tvs: qtd_tvs.toString(),
      qtd_anuncios: qtd_anuncios.toString(),
      data_registro: new Date(condominio.data_registro).toLocaleDateString('pt-BR'),
      cep: condominio.cep.replace(/(\d{5})(\d{3})/, '$1-$2') // Formatar CEP
    };
  });

  // Filtrar condomínios baseado na pesquisa
  const filteredCondominios = condominiosData.filter(condominio => {
    const searchLower = searchTerm.toLowerCase();
    return (
      condominio.nome.toLowerCase().includes(searchLower) ||
      condominio.localizacao.toLowerCase().includes(searchLower) ||
      condominio.cep.includes(searchLower) ||
      condominio.sindico_nome.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (condominio: Condominio) => {
    onEdit(condominio);
  };

  const handleView = (condominio: Condominio) => {
    onView(condominio);
  };

  const handleDelete = (condominio: Condominio) => {
    setDeleteModal({
      isOpen: true,
      condominio: condominio
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.condominio) return;
    
    try {
      await deleteCondominio(deleteModal.condominio.id);
      onNotification('success', `${deleteModal.condominio.nome} foi deletado com sucesso`);
      setDeleteModal({ isOpen: false, condominio: null });
    } catch (error) {
      console.error('Erro ao deletar condominio:', error);
      onNotification('error', 'Erro ao deletar condominio. Tente novamente.');
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, condominio: null });
  };

  const handleNewCondominio = () => {
    onRegister();
  };

  if (loading) {
    return (
      <main className="sindicos-page">
        <div className="page-card">
          <div className="loading">Carregando condominios...</div>
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
            <h1 className="page-title">Condomínios</h1>
            <button className="new-btn" onClick={handleNewCondominio}>
              <FiPlus className="btn-icon" />
              Novo Condomínio
            </button>
          </div>
          
          {/* Barra de Pesquisa */}
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por nome, localização, CEP ou síndico..."
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
              {filteredCondominios.length} {filteredCondominios.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </div>
          )}
          
          {filteredCondominios.length === 0 ? (
            <div className="empty-state">
              <p>{searchTerm ? 'Nenhum condomínio encontrado com esse filtro.' : 'Nenhum condomínio encontrado.'}</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredCondominios}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Deletar Condominio"
        message={`Tem certeza que deseja deletar o condominio "${deleteModal.condominio?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
