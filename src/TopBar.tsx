import { FiLogOut, FiMenu } from 'react-icons/fi';
import './TopBar.css';

interface TopBarProps {
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export default function TopBar({ onLogout, onMenuToggle }: TopBarProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleMenuToggle = () => {
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="menu-toggle-btn"
          onClick={handleMenuToggle}
          aria-label="Abrir menu"
        >
          <FiMenu />
        </button>
        
        <div className="topbar-title">
          <div style={{ width: '5px', height: '35px', backgroundColor: '#F8D442', display: 'inline-block', marginRight: '8px' }}></div>
          ExpoTV
        </div>
      </div>

      <div className="topbar-user">
        <button 
          className="logout-button"
          onClick={handleLogout}
          title="Sair do sistema"
        >
          
        </button>
      </div>
    </header>
  );
}
