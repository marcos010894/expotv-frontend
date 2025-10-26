import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiHome, FiTv, FiSpeaker } from 'react-icons/fi';
import './DashboardPage.css';
import { anuncioService, condominioService } from '../services/api';

interface DashboardStats {
  anunciosAtivos: number;
  anunciosVencidos: number;
  totalCondominios: number;
  totalAnuncios: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    anunciosAtivos: 0,
    anunciosVencidos: 0,
    totalCondominios: 0,
    totalAnuncios: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar anúncios
      const anuncios = await anuncioService.getAnuncios();
      const condominios = await condominioService.getCondominios();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const anunciosAtivos = anuncios.filter(anuncio => {
        const dataExpiracao = new Date(anuncio.data_expiracao);
        return dataExpiracao >= today && anuncio.status === 'ativo';
      }).length;
      
      const anunciosVencidos = anuncios.filter(anuncio => {
        const dataExpiracao = new Date(anuncio.data_expiracao);
        return dataExpiracao < today || anuncio.status === 'inativo';
      }).length;
      
      setStats({
        anunciosAtivos,
        anunciosVencidos,
        totalCondominios: condominios.length,
        totalAnuncios: anuncios.length
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Anúncios Ativos', value: stats.anunciosAtivos, color: '#4CAF50' },
    { name: 'Anúncios Vencidos', value: stats.anunciosVencidos, color: '#FF6B6B' }
  ];

  const barData = [
    {
      name: 'Anúncios Ativos',
      quantidade: stats.anunciosAtivos,
      fill: '#4CAF50'
    },
    {
      name: 'Anúncios Vencidos',
      quantidade: stats.anunciosVencidos,
      fill: '#FF6B6B'
    },
    {
      name: 'Total Condomínios',
      quantidade: stats.totalCondominios,
      fill: '#2196F3'
    }
  ];

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="page-header">
          <h1 className="page-title">Inicio</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Inicio</h1>
        <p className="page-subtitle">Visão geral do sistema</p>
      </div>

      <div className="dashboard-content">
        {/* Cards de estatísticas */}
        <div className="stats-cards">
          <div className="stat-card active">
            <div className="stat-icon">
              <FiSpeaker />
            </div>
            <div className="stat-info">
              <h3>{stats.anunciosAtivos}</h3>
              <p>Anúncios Ativos</p>
            </div>
          </div>

          <div className="stat-card expired">
            <div className="stat-icon">
              <FiSpeaker />
            </div>
            <div className="stat-info">
              <h3>{stats.anunciosVencidos}</h3>
              <p>Anúncios Vencidos</p>
            </div>
          </div>

          <div className="stat-card total">
            <div className="stat-icon">
              <FiHome />
            </div>
            <div className="stat-info">
              <h3>{stats.totalCondominios}</h3>
              <p>Total Condomínios</p>
            </div>
          </div>

          <div className="stat-card all">
            <div className="stat-icon">
              <FiTv />
            </div>
            <div className="stat-info">
              <h3>{stats.totalAnuncios}</h3>
              <p>Total Anúncios</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="charts-container">
          <div className="chart-card">
            <h3>Distribuição de Anúncios</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Estatísticas Gerais</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumo */}
        <div className="summary-card">
          <h3>Resumo do Sistema</h3>
          <div className="summary-content">
            <div className="summary-item">
              <strong>Taxa de Anúncios Ativos:</strong>
              <span className={stats.totalAnuncios > 0 ? 
                (stats.anunciosAtivos / stats.totalAnuncios) >= 0.7 ? 'success' : 'warning' 
                : 'neutral'}>
                {stats.totalAnuncios > 0 ? 
                  `${((stats.anunciosAtivos / stats.totalAnuncios) * 100).toFixed(1)}%` 
                  : '0%'}
              </span>
            </div>
            <div className="summary-item">
              <strong>Média de Anúncios por Condomínio:</strong>
              <span className="neutral">
                {stats.totalCondominios > 0 ? 
                  (stats.totalAnuncios / stats.totalCondominios).toFixed(1) 
                  : '0'}
              </span>
            </div>
            <div className="summary-item">
              <strong>Status Geral:</strong>
              <span className={stats.anunciosAtivos > stats.anunciosVencidos ? 'success' : 'warning'}>
                {stats.anunciosAtivos > stats.anunciosVencidos ? 'Excelente' : 
                 stats.anunciosAtivos === stats.anunciosVencidos ? 'Regular' : 'Atenção Necessária'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
