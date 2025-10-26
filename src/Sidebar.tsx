import { useState } from 'react';
import './Sidebar.css';
import { 
  FiHome,
  FiUsers, 
  FiMonitor, 
  FiMessageSquare, 
  FiUser,
  FiLogOut,
  FiX
} from 'react-icons/fi';
import { authService } from './services/api';
import PhotoUploadModal from './components/PhotoUploadModal';
import ChangePasswordModal from './components/ChangePasswordModal';

interface SidebarProps {
  onNavigate?: (page: string) => void;
  onNotification?: (type: 'success' | 'error', message: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ onNavigate, onNotification, isOpen = true, onClose }: SidebarProps) {
  const [userData, setUserData] = useState(authService.getUserData());
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Definir itens do menu baseado no tipo de usuário
  const getMenuItems = () => {
    if (userData.type === 'sindico') {
      return [
        { icon: FiMessageSquare, label: 'Avisos', page: 'avisos' }
      ];
    }
    
    // Menu para administradores
    return [
      { icon: FiHome, label: 'Início', page: 'inicio' },
      { icon: FiHome, label: 'Condomínios', page: 'condominios' },
      { icon: FiUsers, label: 'Usuários', page: 'sindicos' },
      { icon: FiMonitor, label: "TV's", page: 'tvs' },
      { icon: FiMessageSquare, label: 'Anúncios', page: 'anuncios' },
    ];
  };

  const menuItems = getMenuItems();

  const handleMenuClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    // Fechar menu no mobile após clicar
    if (onClose && window.innerWidth <= 768) {
      onClose();
    }
  };

  const handlePhotoClick = () => {
    setIsPhotoModalOpen(true);
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSuccess = (message: string) => {
    if (onNotification) {
      onNotification('success', message);
    }
  };

  const handlePasswordError = (message: string) => {
    if (onNotification) {
      onNotification('error', message);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const userId = userData.id;
      if (!userId) {
        throw new Error('ID do usuário não encontrado');
      }
      
      // Fazer upload da foto
      await authService.uploadUserPhoto(userId, file);
      
      // Após o upload, criar preview local imediatamente
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        // Atualizar localStorage com a nova foto
        authService.updateUserData({ foto: base64 });
        // Atualizar o estado local
        setUserData(authService.getUserData());
      };
      reader.readAsDataURL(file);
      
      if (onNotification) {
        onNotification('success', 'Foto atualizada com sucesso!');
      }
      
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      if (onNotification) {
        onNotification('error', 'Erro ao atualizar foto. Tente novamente.');
      }
    }
  };

  const handlePhotoRemove = async () => {
    try {
      const userId = userData.id;
      if (!userId) {
        throw new Error('ID do usuário não encontrado');
      }
      
      // Buscar o arquivo avatar.jpeg padrão
      const response = await fetch('/avatar.jpeg');
      const blob = await response.blob();
      const defaultFile = new File([blob], 'avatar.jpeg', { type: 'image/jpeg' });
      
      // Fazer upload do avatar padrão
      await authService.uploadUserPhoto(userId, defaultFile);
      
      // Atualizar localStorage e estado com a foto padrão
      authService.updateUserData({ foto: '/avatar.jpeg' });
      setUserData(authService.getUserData());
      
      if (onNotification) {
        onNotification('success', 'Foto removida com sucesso!');
      }
      
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      if (onNotification) {
        onNotification('error', 'Erro ao remover foto. Tente novamente.');
      }
    }
  };

  const handleLogout = () => {
    // Limpar dados do usuário
    localStorage.clear();
    // Redirecionar para a página de login
    window.location.href = '/';
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
        />
      )}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Botão fechar para mobile */}
        <button 
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <FiX />
        </button>
        
        <div className="user-section">
        <div 
          className="user-photo clickable" 
          onClick={handlePhotoClick}
          title="Clique para alterar foto"
        >
          {userData?.foto && userData.foto.trim() !== '' ? (
            <img 
              src={userData.foto.startsWith('http') || userData.foto.startsWith('data:') 
                ? userData.foto 
                : `data:image/jpeg;base64,${userData.foto}`}
              alt="Foto do usuário"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <FiUser />
          )}
        </div>
        <div className="user-name">{userData.name || 'Usuário'}</div>
        <div className="user-role">{userData.type || 'USER'}</div>
        {userData.type === 'sindico' && (
          <button 
            className="change-password-btn-sidebar" 
            onClick={handleChangePassword}
            title="Trocar Senha"
          >
            Trocar Senha
          </button>
        )}
      </div>
      <nav className="menu">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div 
              className="menu-item" 
              key={item.label}
              onClick={() => handleMenuClick(item.page)}
            >
              <IconComponent className="menu-icon" />
              <span className="menu-label">{item.label}</span>
            </div>
          );
        })}
      </nav>
      
      <div className="menu-exit" onClick={handleLogout}>
        <FiLogOut className="menu-icon" />
        <span className="menu-label">Sair</span>
      </div>

      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onUpload={handlePhotoUpload}
        onRemove={handlePhotoRemove}
        currentPhotoUrl={userData?.foto || undefined}
      />
      
      {isPasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsPasswordModalOpen(false)}
          onSuccess={handlePasswordSuccess}
          onError={handlePasswordError}
        />
      )}
    </aside>
    </>
  );
}
