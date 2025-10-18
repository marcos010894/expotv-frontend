import { useState } from 'react';
import './MainContent.css';

export default function MainContent() {
  const [currentPage, setCurrentPage] = useState('inicio');

  const renderPage = () => {
    switch (currentPage) {
      default:
        return (
          <main className="main-content">
            <div className="main-title">EX CONDOMINIO / Editar</div>
            <div className="main-card">
              <p>Conteúdo central do card branco.</p>
              <p>Página inicial do sistema ExpoTV.</p>
              <button onClick={() => setCurrentPage('sindicos')}>
                Ver Síndicos
              </button>
            </div>
          </main>
        );
    }
  };

  return renderPage();
}
