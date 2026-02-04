import React from 'react';
import { IStockItemDetailsProps, StockStatus } from '../types';

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-2">
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="text-sm text-gray-900 dark:text-gray-100 col-span-2">{value}</dd>
  </div>
);

export default function StockItemDetails({ item }: IStockItemDetailsProps) {
  if (!item) {
    return <p>Nenhum item selecionado.</p>;
  }

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h4 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Informações do Lote</h4>
        <dl>
          <DetailRow label="Produto" value={item.productName} />
          <DetailRow label="Categoria" value={item.category} />
          <DetailRow label="Data de Entrada" value={new Date(item.entryDate).toLocaleDateString()} />
          <DetailRow label="Data de Validade" value={new Date(item.expiryDate).toLocaleDateString()} />
          <DetailRow label="Litragem por Unidade" value={`${item.unitLiters} L`} />
          <DetailRow label="Unidades Iniciais" value={item.unitCount} />
          <DetailRow label="Quantidade Total do Lote" value={`${item.initialQuantityLiters} L`} />
          <DetailRow label="Quantidade Disponível" value={<span className="font-bold">{`${item.availableQuantityLiters} L`}</span>} />
          {/* FIX: Check if unitPrice exists before trying to format it. */}
          {item.unitPrice && <DetailRow label="Preço por Unidade" value={item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />}
          <DetailRow label="Status" value={item.status === StockStatus.ACTIVE ? 'Ativo' : 'Encerrado'} />
          {item.status === StockStatus.CLOSED && item.closureDate && (
             <DetailRow label="Data de Encerramento" value={new Date(item.closureDate).toLocaleDateString()} />
          )}
           {item.observations && <DetailRow label="Observações" value={item.observations} />}
        </dl>
      </div>
      
      <div className="mt-6">
        <h4 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Histórico de Movimentações (Saídas)</h4>
        {item.movements && item.movements.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Motivo</th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantidade</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {item.movements.map((move) => (
                  <tr key={move.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(move.date).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{move.reason.replace('_', ' ')}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">{move.quantity} L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma movimentação registrada para este item.</p>
        )}
      </div>
    </div>
  );
}