import { useState } from 'react';
import { FiX, FiMail, FiSend } from 'react-icons/fi';
import './ForgotPasswordModal.css';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  onError
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      onError('Por favor, informe seu email.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://expotv-backend.fly.dev/forgot-password', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess(data.message);
        setEmail('');
        onClose();
      } else {
        onError(data.message || 'Erro ao processar solicitação.');
      }
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      onError('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Esqueci a Senha</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={loading}
          >
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Informe seu email cadastrado. Se ele estiver em nossa base de dados, 
            você receberá instruções para redefinir sua senha.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="forgot-email">Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="forgot-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Enviar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
