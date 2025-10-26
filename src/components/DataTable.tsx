import './DataTable.css';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

interface Column {
  key: string;
  title: string;
  width?: string;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  onEdit?: (item: any) => void;
  onView?: (item: any) => void;
  onDelete?: (item: any) => void;
}

export default function DataTable({ columns, data, onEdit, onView, onDelete }: DataTableProps) {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr className="table-header">
            {columns.map((column) => (
              <th 
                key={column.key} 
                style={{ 
                  width: column.width,
                  textAlign: ['qtd_tvs', 'qtd_anuncios'].includes(column.key) ? 'center' : 'left'
                }}
              >
                {column.title}
              </th>
            ))}
            <th className="actions-column">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="table-row">
              {columns.map((column) => (
                <td 
                  key={column.key} 
                  className="table-cell"
                  data-column={column.key}
                  style={{ 
                    textAlign: ['qtd_tvs', 'qtd_anuncios'].includes(column.key) ? 'center' : 'left',
                    fontWeight: ['qtd_tvs', 'qtd_anuncios'].includes(column.key) ? '600' : 'normal'
                  }}
                >
                  {item[column.key]}
                </td>
              ))}
              <td className="table-cell actions-cell">
                <div className="action-buttons">
                  {onView && (
                    <button 
                      className="action-btn view-btn" 
                      onClick={() => onView(item)}
                      title="Visualizar"
                    >
                      <FiEye size={12} /> Ver
                    </button>
                  )}
                  {onEdit && (
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => onEdit(item)}
                      title="Editar"
                    >
                      <FiEdit size={12} /> Editar
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => onDelete(item)}
                      title="Deletar"
                    >
                      <FiTrash2 size={12} /> Deletar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
