import { useState, useEffect } from 'react';
import { avisoService, type Aviso, authService } from '../services/api';

export const useAvisos = () => {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvisos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = authService.getUserData();
      let data: Aviso[];
      
      if (userData.type === 'sindico') {
        // Usar endpoint específico para síndico
        data = await avisoService.getBySindico(parseInt(userData.id || '0'));
      } else {
        // Admin busca todos os avisos
        data = await avisoService.getAll();
      }
      
      setAvisos(data);
    } catch (err) {
      setError('Erro ao carregar avisos');
    } finally {
      setLoading(false);
    }
  };

  const createAviso = async (avisoData: Omit<Aviso, 'id' | 'data_criacao' | 'image' | 'video'> & { image?: File; video?: File }) => {
    try {
      setLoading(true);
      const newAviso = await avisoService.create(avisoData);
      setAvisos(prev => [...prev, newAviso]);
      return newAviso;
    } catch (err) {
      setError('Erro ao criar aviso');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAviso = async (id: number, avisoData: Partial<Omit<Aviso, 'image' | 'video'>> & { image?: File; video?: File }) => {
    try {
      setLoading(true);
      
      // Verificar se o usuário pode editar este aviso
      const userData = authService.getUserData();

      
      const updatedAviso = await avisoService.update(id, avisoData);
      setAvisos(prev => prev.map(aviso => aviso.id === id ? updatedAviso : aviso));
      return updatedAviso;
    } catch (err) {
      setError('Erro ao atualizar aviso');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAviso = async (id: number) => {
    try {
      setLoading(true);
      
      // Verificar se o usuário pode deletar este aviso
      const userData = authService.getUserData();

      await avisoService.delete(id);
      setAvisos(prev => prev.filter(aviso => aviso.id !== id));
    } catch (err) {
      setError('Erro ao deletar aviso');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvisos();
  }, []); // Mantém vazio pois o filtro é baseado no localStorage que não muda durante a sessão

  return {
    avisos,
    loading,
    error,
    refetch: fetchAvisos,
    createAviso,
    updateAviso,
    deleteAviso,
  };
};