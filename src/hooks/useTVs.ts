import { useState, useEffect } from 'react';
import { tvService, condominioService, type TV, type Condominio } from '../services/api';

export const useTVs = () => {
  const [tvs, setTVs] = useState<TV[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTVs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tvService.getTVs();
      setTVs(data);
    } catch (err) {
      setError('Erro ao carregar TVs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCondominios = async () => {
    try {
      const data = await condominioService.getCondominios();
      setCondominios(data);
    } catch (err) {
      console.error('Erro ao carregar condomínios:', err);
    }
  };

  const createTV = async (tvData: Omit<TV, 'id' | 'data_registro'>) => {
    try {
      setLoading(true);
      const newTV = await tvService.createTV(tvData);
      setTVs(prev => [...prev, newTV]);
      return newTV;
    } catch (err) {
      setError('Erro ao criar TV');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTV = async (id: number, tvData: Partial<TV>) => {
    try {
      setLoading(true);
      const updatedTV = await tvService.updateTV(id, tvData);
      setTVs(prev => prev.map(tv => tv.id === id ? updatedTV : tv));
      return updatedTV;
    } catch (err) {
      setError('Erro ao atualizar TV');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTV = async (id: number) => {
    try {
      setLoading(true);
      await tvService.deleteTV(id);
      setTVs(prev => prev.filter(tv => tv.id !== id));
    } catch (err) {
      setError('Erro ao deletar TV');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTVs();
    fetchCondominios();
  }, []);

  return {
    tvs,
    condominios,
    loading,
    error,
    refetch: fetchTVs,
    createTV,
    updateTV,
    deleteTV,
  };
};
