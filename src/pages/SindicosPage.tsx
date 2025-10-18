import './SindicosPage.css';
import { FiPlus } from 'react-icons/fi';
import { useState } from 'react';
import DataTable from '../components/DataTable';
import ConfirmModal from '../components/ConfirmModal';
import { useUsers } from '../hooks/useUsers';
import { type User } from '../services/api';

interface SindicosPageProps {
  onRegister: () => void;
  onEdit: (user: User) => void;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

const columns = [
  { key: 'id', title: 'ID', width: '60px' },
  { key: 'nome', title: 'Nome', width: '200px' },
  { key: 'email', title: 'Email', width: '220px' },
  { key: 'telefone', title: 'Telefone', width: '140px' },
  { key: 'tipo', title: 'Tipo', width: '100px' },
  { key: 'data_criacao', title: 'Data de Criação', width: '140px' }
];

export default function SindicosPage({ onRegister, onEdit, onNotification }: SindicosPageProps) {
  const { users, loading, error, deleteUser } = useUsers();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    user: User | null;
  }>({
    isOpen: false,
    user: null
  });

  // Filtrar apenas síndicos ou mostrar todos dependendo da necessidade
  const sindicosData = users.map(user => ({
    ...user,
    data_criacao: new Date(user.data_criacao).toLocaleDateString('pt-BR'),
    telefone: user.telefone || 'N/A'
  }));

  const handleEdit = (user: User) => {
    onEdit(user);
  };

  const handleDelete = (user: User) => {
    setDeleteModal({
      isOpen: true,
      user: user
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.user) return;
    
    setDeleteLoading(true);
    try {
      await deleteUser(deleteModal.user.id);
      onNotification('success', `${deleteModal.user.nome} foi deletado com sucesso`);
      setDeleteModal({ isOpen: false, user: null });
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      onNotification('error', 'Erro ao deletar usuário. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  const handleNewSindico = () => {
    onRegister();
  };

  if (loading) {
    return (
      <main className="sindicos-page">
        <div className="loading">Carregando usuários...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="sindicos-page">
        <div className="error">Erro: {error}</div>
      </main>
    );
  }

  return (
    <>
      <main className="sindicos-page">
        <div className="page-card">
          <div className="page-header">
            <h1 className="page-title">Síndicos</h1>
            <button className="new-btn" onClick={handleNewSindico}>
              <FiPlus className="btn-icon" />
              Novo Síndico
            </button>
          </div>
          
          {sindicosData.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum síndico encontrado.</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={sindicosData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Deletar Usuário"
        message={`Tem certeza que deseja deletar o usuário "${deleteModal.user?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText={deleteLoading ? "Deletando..." : "Deletar"}
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
