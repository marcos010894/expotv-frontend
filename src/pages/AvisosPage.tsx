import { useState } from 'react';
import './AvisosPage.css';
import { FiPlus } from 'react-icons/fi';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import { useAvisos } from '../hooks/useAvisos';

interface AvisosPageProps {
  onRegister: () => void;
  onEdit: (aviso: Aviso) => void;
  onView: (aviso: Aviso) => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

interface Aviso {
  id: number;
  nome: string;
  condominios_ids: string;
  numero_anunciante?: string;
  nome_anunciante?: string;
  status: string;
  data_expiracao?: string;
  mensagem: string;
  image?: string | null;
  sindico_id: number;
  condominio_id: number;
  data_criacao: string;
}

const columns = [
  { key: 'id', title: 'ID', width: '60px' },
  { key: 'nome', title: 'Nome/Título', width: '200px' },
  { key: 'mensagem', title: 'Mensagem', width: '250px' },
  { key: 'status', title: 'Status', width: '100px' },
  { key: 'data_expiracao', title: 'Expiração', width: '120px' }
];

export default function AvisosPage({ onRegister, onEdit, onView, onNotification }: AvisosPageProps) {
  const { avisos, loading, error, deleteAviso } = useAvisos();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    aviso: Aviso | null;
  }>({
    isOpen: false,
    aviso: null
  });

  const handleNewAviso = () => {
    onRegister();
  };

  const handleEdit = (aviso: Aviso) => {
    onEdit(aviso);
  };

  const handleView = (aviso: Aviso) => {
    onView(aviso);
  };

  const handleDelete = (aviso: Aviso) => {
    setDeleteModal({ isOpen: true, aviso });
  };

  const confirmDelete = async () => {
    if (!deleteModal.aviso) return;
    
    setDeleteLoading(true);
    try {
      await deleteAviso(deleteModal.aviso.id);
      onNotification('success', 'Aviso excluído com sucesso!');
      setDeleteModal({ isOpen: false, aviso: null });
    } catch (error) {
      console.error('Erro ao excluir aviso:', error);
      onNotification('error', 'Erro ao excluir aviso');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, aviso: null });
  };

  // Processar dados para exibição
  const avisosData = avisos.map(aviso => ({
    ...aviso,
    data_expiracao: aviso.data_expiracao ? new Date(aviso.data_expiracao).toLocaleDateString('pt-BR') : 'Sem expiração',
    mensagem: aviso.mensagem.length > 50 ? aviso.mensagem.substring(0, 50) + '...' : aviso.mensagem,
    status: aviso.status.charAt(0).toUpperCase() + aviso.status.slice(1)
  }));

  if (loading) {
    return (
      <main className="sindicos-page">
        <div className="page-card">
          <div className="loading">Carregando avisos...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="sindicos-page">
        <div className="page-card">
          <div className="error">Erro ao carregar avisos</div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="sindicos-page">
        <div className="page-card">
          <div className="page-header">
            <h1 className="page-title">Avisos do Condomínio</h1>
            <button className="new-btn" onClick={handleNewAviso}>
              <FiPlus className="btn-icon" />
              Novo Aviso
            </button>
          </div>
          
          <DataTable
            columns={columns}
            data={avisosData}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Deletar Aviso"
        message={`Tem certeza que deseja deletar o aviso "${deleteModal.aviso?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText={deleteLoading ? "Deletando..." : "Deletar"}
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
