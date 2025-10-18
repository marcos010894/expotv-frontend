import { useState } from 'react';
import './ChangePasswordModal.css';
import { FiX, FiLock } from 'react-icons/fi';
import { userService, authService } from '../services/api';

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function ChangePasswordModal({ onClose, onSuccess, onError }: ChangePasswordModalProps) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!senhaAtual || !senhaNova || !confirmarSenha) {
      onError('Preencha todos os campos');
      return;
    }

    if (senhaNova.length < 6) {
      onError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (senhaNova !== confirmarSenha) {
      onError('A nova senha e a confirmação não coincidem');
      return;
    }

    if (senhaAtual === senhaNova) {
      onError('A nova senha deve ser diferente da senha atual');
      return;
    }

    setLoading(true);
    try {
      const userId = parseInt(authService.getUserData().id || '0');
      await userService.changePassword(userId, senhaAtual, senhaNova);
      onSuccess('Senha alterada com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('Erro ao trocar senha:', error);
      const errorMessage = error?.response?.data?.detail || 'Erro ao trocar senha. Verifique se a senha atual está correta.';
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FiLock />
            <h2>Trocar Senha</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="senhaAtual">Senha Atual *</label>
            <input
              type="password"
              id="senhaAtual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senhaNova">Nova Senha *</label>
            <input
              type="password"
              id="senhaNova"
              value={senhaNova}
              onChange={(e) => setSenhaNova(e.target.value)}
              placeholder="Digite a nova senha (mínimo 6 caracteres)"
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Nova Senha *</label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme a nova senha"
              disabled={loading}
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
