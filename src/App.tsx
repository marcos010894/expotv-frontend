
import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SindicosPage from './pages/SindicosPage';
import RegistrarSindicoPage from './pages/RegistrarSindicoPage';
import EditarSindicoPage from './pages/EditarSindicoPage';
import CondominiosPage from './pages/CondominiosPage';
import RegistrarCondominioPage from './pages/RegistrarCondominioPage';
import { EditarCondominioPage } from './pages/EditarCondominioPage';
import { DetalhesCondominioPage } from './pages/DetalhesCondominioPage';
import TVsPage from './pages/TVsPage';
import RegistrarTVPage from './pages/RegistrarTVPage';
import { EditarTVPage } from './pages/EditarTVPage';
import { DetalhesTVPage } from './pages/DetalhesTVPage';
import AnunciosPage from './pages/AnunciosPage';
import RegistrarAnuncioPage from './pages/RegistrarAnuncioPage';
import EditarAnuncioPage from './pages/EditarAnuncioPage';
import DetalhesAnuncioPage from './pages/DetalhesAnuncioPage';
import AvisosPage from './pages/AvisosPage';
import RegistrarAvisoPage from './pages/RegistrarAvisoPage';
import EditarAvisoPage from './pages/EditarAvisoPage';
import Notification from './components/Notification';
import { type User, type Anuncio, authService } from './services/api';

type Page = 'inicio' | 'condominios' | 'sindicos' | 'tvs' | 'anuncios' | 'avisos' | 'registrar-sindico' | 'editar-sindico' | 'registrar-condominio' | 'editar-condominio' | 'detalhes-condominio' | 'registrar-tv' | 'editar-tv' | 'detalhes-tv' | 'registrar-anuncio' | 'editar-anuncio' | 'detalhes-anuncio' | 'registrar-aviso' | 'editar-aviso' | 'detalhes-aviso';

interface NotificationState {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Função para obter página inicial baseada no tipo de usuário
  const getInitialPage = (): Page => {
    const userData = authService.getUserData();
    if (userData.type === 'sindico') {
      return 'avisos';
    }
    return 'inicio';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage());
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCondominioId, setEditingCondominioId] = useState<number | null>(null);
  const [viewingCondominioId, setViewingCondominioId] = useState<number | null>(null);
  const [editingTVId, setEditingTVId] = useState<number | null>(null);
  const [viewingTVId, setViewingTVId] = useState<number | null>(null);
  const [editingAnuncio, setEditingAnuncio] = useState<Anuncio | null>(null);
  const [viewingAnuncio, setViewingAnuncio] = useState<Anuncio | null>(null);
  const [editingAviso, setEditingAviso] = useState<any | null>(null);
  const [viewingAviso, setViewingAviso] = useState<any | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    type: 'success',
    message: '',
    show: false
  });

  // Verificar autenticação na inicialização
  useEffect(() => {
    const checkAuth = () => {
      authService.initializeAuth();
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage(getInitialPage());
    showNotification('success', 'Login realizado com sucesso!');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentPage('inicio');
    showNotification('success', 'Logout realizado com sucesso!');
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'inicio':
        return <DashboardPage />;
      case 'condominios':
        return (
          <CondominiosPage 
            onRegister={() => setCurrentPage('registrar-condominio')}
            onEdit={(condominio) => {
              setEditingCondominioId(condominio.id);
              setCurrentPage('editar-condominio');
            }}
            onView={(condominio) => {
              setViewingCondominioId(condominio.id);
              setCurrentPage('detalhes-condominio');
            }}
            onNotification={showNotification}
          />
        );
      case 'registrar-condominio':
        return (
          <RegistrarCondominioPage
            onBack={() => setCurrentPage('condominios')}
            onSuccess={(message) => {
              showNotification('success', message);
              setCurrentPage('condominios');
            }}
            onError={(message) => showNotification('error', message)}
          />
        );
      case 'editar-condominio':
        if (!editingCondominioId) {
          setCurrentPage('condominios');
          return null;
        }
        return (
          <EditarCondominioPage
            condominioId={editingCondominioId}
            onBack={() => {
              setEditingCondominioId(null);
              setCurrentPage('condominios');
            }}
          />
        );
      case 'detalhes-condominio':
        if (!viewingCondominioId) {
          setCurrentPage('condominios');
          return null;
        }
        return (
          <DetalhesCondominioPage
            condominioId={viewingCondominioId}
            onBack={() => {
              setViewingCondominioId(null);
              setCurrentPage('condominios');
            }}
          />
        );
      case 'tvs':
        return (
          <TVsPage 
            onRegister={() => setCurrentPage('registrar-tv')}
            onEdit={(tv) => {
              setEditingTVId(tv.id);
              setCurrentPage('editar-tv');
            }}
            onView={(tv) => {
              setViewingTVId(tv.id);
              setCurrentPage('detalhes-tv');
            }}
            onNotification={showNotification}
          />
        );
      case 'registrar-tv':
        return (
          <RegistrarTVPage
            onBack={() => setCurrentPage('tvs')}
            onSuccess={(message) => {
              showNotification('success', message);
              setCurrentPage('tvs');
            }}
            onError={(message) => showNotification('error', message)}
          />
        );
      case 'editar-tv':
        if (!editingTVId) {
          setCurrentPage('tvs');
          return null;
        }
        return (
          <EditarTVPage
            tvId={editingTVId}
            onBack={() => {
              setEditingTVId(null);
              setCurrentPage('tvs');
            }}
          />
        );
      case 'detalhes-tv':
        if (!viewingTVId) {
          setCurrentPage('tvs');
          return null;
        }
        return (
          <DetalhesTVPage
            tvId={viewingTVId}
            onBack={() => {
              setViewingTVId(null);
              setCurrentPage('tvs');
            }}
          />
        );
      case 'sindicos':
        return (
          <SindicosPage 
            onRegister={() => setCurrentPage('registrar-sindico')}
            onEdit={(user) => {
              setEditingUser(user);
              setCurrentPage('editar-sindico');
            }}
            onNotification={showNotification}
          />
        );
      case 'registrar-sindico':
        return (
          <RegistrarSindicoPage
            onBack={() => setCurrentPage('sindicos')}
            onSuccess={(message) => showNotification('success', message)}
            onError={(message) => showNotification('error', message)}
          />
        );
      case 'editar-sindico':
        if (!editingUser) {
          setCurrentPage('sindicos');
          return null;
        }
        return (
          <EditarSindicoPage
            user={editingUser}
            onBack={() => {
              setEditingUser(null);
              setCurrentPage('sindicos');
            }}
            onSuccess={(message) => {
              showNotification('success', message);
              setEditingUser(null);
            }}
            onError={(message) => showNotification('error', message)}
          />
        );
      case 'anuncios':
        return (
          <AnunciosPage 
            onRegister={() => setCurrentPage('registrar-anuncio')}
            onEdit={(anuncio) => {
              setEditingAnuncio(anuncio);
              setCurrentPage('editar-anuncio');
            }}
            onView={(anuncio) => {
              setViewingAnuncio(anuncio);
              setCurrentPage('detalhes-anuncio');
            }}
            onNotification={showNotification}
          />
        );
      case 'avisos':
        return (
          <AvisosPage 
            onRegister={() => setCurrentPage('registrar-aviso')}
            onEdit={(aviso) => {
              setEditingAviso(aviso);
              setCurrentPage('editar-aviso');
            }}
            onView={(aviso) => {
              setViewingAviso(aviso);
              setCurrentPage('detalhes-aviso');
            }}
            onNotification={showNotification}
          />
        );
      case 'registrar-aviso':
        return (
          <RegistrarAvisoPage
            onBack={() => setCurrentPage('avisos')}
            onSuccess={(message: string) => {
              showNotification('success', message);
              setCurrentPage('avisos');
            }}
            onError={(message: string) => showNotification('error', message)}
          />
        );
      case 'editar-aviso':
        if (!editingAviso) {
          setCurrentPage('avisos');
          return null;
        }
        return (
          <EditarAvisoPage
            avisoId={editingAviso.id}
            onBack={() => {
              setEditingAviso(null);
              setCurrentPage('avisos');
            }}
            onSuccess={(message) => {
              showNotification('success', message);
              setEditingAviso(null);
              setCurrentPage('avisos');
            }}
            onError={(message) => showNotification('error', message)}
          />
        );
      case 'detalhes-aviso':
        return (
          <div>
            <h2>Detalhes do Aviso - Em implementação</h2>
            <button onClick={() => setCurrentPage('avisos')}>Voltar</button>
          </div>
        );
      case 'registrar-anuncio':
        return (
          <RegistrarAnuncioPage
            onBack={() => setCurrentPage('anuncios')}
            onSuccess={(message) => {
              showNotification('success', message);
              setCurrentPage('anuncios');
            }}
            onError={(message) => showNotification('error', message)}
          />
        );
      case 'editar-anuncio':
        if (!editingAnuncio) {
          setCurrentPage('anuncios');
          return null;
        }
        return (
          <EditarAnuncioPage
            anuncio={editingAnuncio}
            onBack={() => {
              setEditingAnuncio(null);
              setCurrentPage('anuncios');
            }}
            onSuccess={(message) => {
              showNotification('success', message);
              setEditingAnuncio(null);
              setCurrentPage('anuncios');
            }}
            onError={(message) => showNotification('error', message)}
          />
        );
      case 'detalhes-anuncio':
        if (!viewingAnuncio) {
          setCurrentPage('anuncios');
          return null;
        }
        return (
          <DetalhesAnuncioPage
            anuncio={viewingAnuncio}
            onBack={() => {
              setViewingAnuncio(null);
              setCurrentPage('anuncios');
            }}
          />
        );
      default:
        return <DashboardPage />;
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage 
          onLoginSuccess={handleLogin}
          onError={(message) => showNotification('error', message)}
        />
        {notification.show && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={hideNotification}
          />
        )}
      </>
    );
  }

  return (
    <div className="app-root">
      <Sidebar 
        onNavigate={(page) => setCurrentPage(page as Page)} 
        onNotification={showNotification}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="app-main">
        <TopBar 
          onLogout={handleLogout}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        {renderContent()}
      </div>
      
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  );
}

export default App;
