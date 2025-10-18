import { FiLogOut } from 'react-icons/fi';
import './TopBar.css';

interface TopBarProps {
  onLogout?: () => void;
}

export default function TopBar({ onLogout }: TopBarProps) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-title">ExpoTV</div>
      
      <div className="topbar-user">
        <button 
          className="logout-button"
          onClick={handleLogout}
          title="Sair do sistema"
        >
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}
