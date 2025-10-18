import './CondominiosPage.css';
import { FiPlus } from 'react-icons/fi';
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
  { key: 'nome', title: 'Nome', width: '200px' },
  { key: 'localizacao', title: 'Localização', width: '180px' },
  { key: 'cep', title: 'CEP', width: '100px' },
  { key: 'sindico_nome', title: 'Síndico', width: '150px' },
  { key: 'data_registro', title: 'Data de Registro', width: '140px' }
];

export default function CondominiosPage({ onRegister, onEdit, onView, onNotification }: CondominiosPageProps) {
  const { condominios, sindicos, loading, error, deleteCondominio } = useCondominios();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    condominio: Condominio | null;
  }>({
    isOpen: false,
    condominio: null
  });

  // Mapear dados dos condominios com nome do síndico
  const condominiosData = condominios.map(condominio => {
    const sindico = sindicos.find(s => s.id === condominio.sindico_id);
    return {
      ...condominio,
      sindico_nome: sindico?.nome || 'N/A',
      data_registro: new Date(condominio.data_registro).toLocaleDateString('pt-BR'),
      cep: condominio.cep.replace(/(\d{5})(\d{3})/, '$1-$2') // Formatar CEP
    };
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
            <h1 className="page-title">Condominios</h1>
            <button className="new-btn" onClick={handleNewCondominio}>
              <FiPlus className="btn-icon" />
              Novo Condominio
            </button>
          </div>
          
          {condominiosData.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum condomínio encontrado.</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={condominiosData}
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
