import React, { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useTVs } from '../hooks/useTVs';
import Notification from '../components/Notification';
import './RegistrarTVPage.css';

interface Props {
    onBack?: () => void;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

export default function RegistrarTVPage({ onBack, onSuccess, onError }: Props) {
    const { condominios, createTV } = useTVs();
    
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    
    const [formData, setFormData] = useState({
        nome: '',
        condominio_id: '',
        codigo_conexao: '',
        status: 'offline' as 'online' | 'offline',
        template: 'Template 1'
    });

    const generateConnectionCode = () => {
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        setFormData(prev => ({ ...prev, codigo_conexao: code }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setLoading(true);
        try {
            await createTV({
                nome: formData.nome,
                condominio_id: parseInt(formData.condominio_id),
                codigo_conexao: formData.codigo_conexao,
                status: formData.status,
                template: formData.template
            });
            
            const message = 'TV cadastrada com sucesso!';
            if (onSuccess) {
                onSuccess(message);
            } else {
                setNotification({ type: 'success', message });
                setTimeout(() => onBack && onBack(), 1500);
            }
        } catch (error) {
            const message = 'Erro ao cadastrar TV. Tente novamente.';
            if (onError) {
                onError(message);
            } else {
                setNotification({ type: 'error', message });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        onBack && onBack();
    };

    return (
        <div className="sindicos-page">
            <div className="page-card">
                <div className="register-form">
                    <div className="page-header">
                        <h1 className="page-title">Cadastrar Nova TV</h1>
                        <button onClick={handleBack} className="back-btn">
                            <FiArrowLeft size={20} />
                            Voltar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nome">Nome da TV</label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Sala de festa, Portaria, etc."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="condominio_id">Condomínio</label>
                                <select
                                    id="condominio_id"
                                    name="condominio_id"
                                    value={formData.condominio_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Selecione um condomínio</option>
                                    {condominios.map(condominio => (
                                        <option key={condominio.id} value={condominio.id}>
                                            {condominio.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="codigo_conexao">Código de Conexão</label>
                                <div className="input-with-button">
                                    <input
                                        type="text"
                                        id="codigo_conexao"
                                        name="codigo_conexao"
                                        value={formData.codigo_conexao}
                                        onChange={handleInputChange}
                                        placeholder="Código de 5 dígitos"
                                        required
                                        maxLength={5}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={generateConnectionCode}
                                        className="generate-btn"
                                    >
                                        Gerar
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="template">Template</label>
                                <select
                                    id="template"
                                    name="template"
                                    value={formData.template}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Template 1">Template 1</option>
                                    <option value="Template 2">Template 2</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    disabled
                                    style={{ 
                                        backgroundColor: '#f5f5f5', 
                                        cursor: 'not-allowed',
                                        color: '#666'
                                    }}
                                >
                                    <option value="offline">Offline</option>
                                    <option value="online">Online</option>
                                </select>
                                <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    A TV será criada como offline. O status mudará automaticamente quando a TV se conectar.
                                </small>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={handleBack} className="btn btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" disabled={loading} className="btn btn-primary">
                                {loading ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
}
