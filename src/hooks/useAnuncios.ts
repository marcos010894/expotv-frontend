import { useState, useEffect } from 'react';
import { anuncioService, condominioService, type Anuncio, type Condominio } from '../services/api';

export const useAnuncios = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnuncios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await anuncioService.getAnuncios();
      setAnuncios(data);
    } catch (err) {
      setError('Erro ao carregar anúncios');
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

  const createAnuncio = async (anuncioData: Omit<Anuncio, 'id'> & { image?: File }) => {
    try {
      setLoading(true);
      const newAnuncio = await anuncioService.createAnuncio(anuncioData);
      setAnuncios(prev => [...prev, newAnuncio]);
      return newAnuncio;
    } catch (err) {
      setError('Erro ao criar anúncio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAnuncio = async (id: number, anuncioData: Partial<Anuncio>) => {
    try {
      setLoading(true);
      const updatedAnuncio = await anuncioService.updateAnuncio(id, anuncioData);
      setAnuncios(prev => prev.map(anuncio => anuncio.id === id ? updatedAnuncio : anuncio));
      return updatedAnuncio;
    } catch (err) {
      setError('Erro ao atualizar anúncio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAnuncio = async (id: number) => {
    try {
      setLoading(true);
      await anuncioService.deleteAnuncio(id);
      setAnuncios(prev => prev.filter(anuncio => anuncio.id !== id));
    } catch (err) {
      setError('Erro ao deletar anúncio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para obter nomes dos condomínios a partir dos IDs
  const getCondominiosNames = (condominiosIds: string | number[]): string => {
    if (!condominiosIds) return 'N/A';
    
    let ids: number[] = [];
    
    if (typeof condominiosIds === 'string') {
      if (condominiosIds.startsWith('[') && condominiosIds.endsWith(']')) {
        // JSON array format
        try {
          ids = JSON.parse(condominiosIds);
        } catch {
          ids = condominiosIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        }
      } else {
        // Comma separated format
        ids = condominiosIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      }
    } else if (Array.isArray(condominiosIds)) {
      ids = condominiosIds;
    }
    
    if (ids.length === 0) return 'N/A';
    
    const names = ids.map(id => {
      const condominio = condominios.find(c => c.id === id);
      return condominio?.nome || `ID:${id}`;
    });
    
    return names.join(', ');
  };

  useEffect(() => {
    fetchAnuncios();
    fetchCondominios();
  }, []);

  return {
    anuncios,
    condominios,
    loading,
    error,
    refetch: fetchAnuncios,
    createAnuncio,
    updateAnuncio,
    deleteAnuncio,
    getCondominiosNames,
  };
};
