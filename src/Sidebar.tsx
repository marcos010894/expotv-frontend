import { useState } from 'react';
import './Sidebar.css';
import { 
  FiHome,
  FiUsers, 
  FiMonitor, 
  FiMessageSquare, 
  FiUser
} from 'react-icons/fi';
import { authService } from './services/api';
import PhotoUploadModal from './components/PhotoUploadModal';
import ChangePasswordModal from './components/ChangePasswordModal';

interface SidebarProps {
  onNavigate?: (page: string) => void;
  onNotification?: (type: 'success' | 'error', message: string) => void;
}

export default function Sidebar({ onNavigate, onNotification }: SidebarProps) {
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
      { icon: FiHome, label: 'Inicio', page: 'inicio' },
      { icon: FiHome, label: 'Condominios', page: 'condominios' },
      { icon: FiUsers, label: 'Sindicos', page: 'sindicos' },
      { icon: FiMonitor, label: "Tv's", page: 'tvs' },
      { icon: FiMessageSquare, label: 'Anuncios', page: 'anuncios' },
    ];
  };

  const menuItems = getMenuItems();

  const handleMenuClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
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

  return (
    <aside className="sidebar" style={{paddingTop: '8%', paddingBottom: '8%'}}>
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
      {/* <div className="menu-exit">
        <FiLogOut className="menu-icon" />
        <span className="menu-label">Sair</span>
      </div> */}

      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onUpload={handlePhotoUpload}
      />
      
      {isPasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsPasswordModalOpen(false)}
          onSuccess={handlePasswordSuccess}
          onError={handlePasswordError}
        />
      )}
    </aside>
  );
}
