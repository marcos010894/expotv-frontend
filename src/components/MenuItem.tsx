import './MenuItem.css';

interface MenuItemProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

export default function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <div className="menu-item" onClick={onClick}>
      <span className="menu-icon">{icon}</span>
      <span className="menu-label">{label}</span>
    </div>
  );
}
