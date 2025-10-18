import './TVsPage.css';
import { FiPlus } from 'react-icons/fi';
import { useState } from 'react';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import { useTVs } from '../hooks/useTVs';
import { type TV } from '../services/api';

interface TVsPageProps {
  onRegister: () => void;
  onEdit: (tv: TV) => void;
  onView: (tv: TV) => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

const columns = [
  { key: 'id', title: 'ID', width: '60px' },
  { key: 'nome', title: 'Nome', width: '200px' },
  { key: 'codigo_conexao', title: 'Código Conexão', width: '140px' },
  { key: 'condominio_nome', title: 'Condomínio', width: '180px' },
  { key: 'template', title: 'Template', width: '120px' },
  { key: 'status', title: 'Status', width: '100px' },
  { key: 'data_registro', title: 'Data de Registro', width: '140px' }
];

export default function TVsPage({ onRegister, onEdit, onView, onNotification }: TVsPageProps) {
  const { tvs, condominios, loading, error, deleteTV } = useTVs();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    tv: TV | null;
  }>({
    isOpen: false,
    tv: null
  });

  const handleNewTV = () => {
    onRegister();
  };

  // Processar dados para a tabela
  const tvsData = tvs.map(tv => {
    const condominio = condominios.find(c => c.id === tv.condominio_id);
    return {
      ...tv,
      condominio_nome: condominio?.nome || 'N/A',
      data_registro: new Date(tv.data_registro).toLocaleDateString('pt-BR'),
      status: tv.status === 'online' ? 'Online' : 'Offline'
    };
  });

  const handleEdit = (tv: TV) => {
    onEdit(tv);
  };

  const handleView = (tv: TV) => {
    onView(tv);
  };

  const handleDelete = (tv: TV) => {
    setDeleteModal({
      isOpen: true,
      tv: tv
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.tv) return;
    
    try {
      await deleteTV(deleteModal.tv.id);
      onNotification('success', `TV "${deleteModal.tv.nome}" foi deletada com sucesso`);
      setDeleteModal({ isOpen: false, tv: null });
    } catch (error) {
      console.error('Erro ao deletar TV:', error);
      onNotification('error', 'Erro ao deletar TV. Tente novamente.');
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, tv: null });
  };

  if (loading) {
    return (
      <div className="sindicos-page">
        <div className="page-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Carregando TVs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sindicos-page">
        <div className="page-card">
          <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="sindicos-page">
        <div className="page-card">
          <div className="page-header">
            <h1 className="page-title">TVs</h1>
            <button className="new-btn" onClick={handleNewTV}>
              <FiPlus className="btn-icon" />
              Nova TV
            </button>
          </div>
          
          <DataTable
            columns={columns}
            data={tvsData}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Deletar TV"
        message={`Tem certeza que deseja deletar a TV "${deleteModal.tv?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
