import { useState, useEffect } from 'react';
import { condominioService, userService, type Condominio, type User } from '../services/api';

export const useCondominios = () => {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [sindicos, setSindicos] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCondominios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await condominioService.getCondominios();
      setCondominios(data);
    } catch (err) {
      setError('Erro ao carregar condominios');
    } finally {
      setLoading(false);
    }
  };

  const fetchSindicos = async () => {
    try {
      const users = await userService.getUsers();
      setSindicos(users.filter(user => user.tipo === 'sindico'));
    } catch (err) {
      console.error('Erro ao carregar síndicos:', err);
    }
  };

  const createCondominio = async (condominioData: Omit<Condominio, 'id' | 'data_registro'>) => {
    try {
      setLoading(true);
      const newCondominio = await condominioService.createCondominio(condominioData);
      setCondominios(prev => [...prev, newCondominio]);
      return newCondominio;
    } catch (err) {
      setError('Erro ao criar condominio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCondominio = async (id: number, condominioData: Partial<Condominio>) => {
    try {
      setLoading(true);
      const updatedCondominio = await condominioService.updateCondominio(id, condominioData);
      setCondominios(prev => prev.map(cond => cond.id === id ? updatedCondominio : cond));
      return updatedCondominio;
    } catch (err) {
      setError('Erro ao atualizar condominio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCondominio = async (id: number) => {
    try {
      setLoading(true);
      await condominioService.deleteCondominio(id);
      setCondominios(prev => prev.filter(cond => cond.id !== id));
    } catch (err) {
      setError('Erro ao deletar condominio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondominios();
    fetchSindicos();
  }, []);

  return {
    condominios,
    sindicos,
    loading,
    error,
    refetch: fetchCondominios,
    createCondominio,
    updateCondominio,
    deleteCondominio,
  };
};
