import './UserSection.css';
import { FiLock } from 'react-icons/fi';

interface UserSectionProps {
  name: string;
  role: string;
  photo: string;
  onChangePassword?: () => void;
}

export default function UserSection({ name, role, photo, onChangePassword }: UserSectionProps) {
  return (
    <div className="user-section">
      <img className="user-photo" src={photo} alt="Foto do usuário" />
      <div className="user-name">{name}</div>
      <div className="user-role">{role}</div>
      {onChangePassword && (
        <button className="change-password-btn" onClick={onChangePassword} title="Trocar Senha">
          <FiLock />
          <span>Trocar Senha</span>
        </button>
      )}
    </div>
  );
}
