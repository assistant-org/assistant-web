import React from "react";
import Card from "../../../../shared/components/Card";
import { IProductSummary } from "../types";

interface StockSummaryCardsProps {
  summaries: IProductSummary[];
}

export default function StockSummaryCards({ summaries }: StockSummaryCardsProps) {
  if (summaries.length === 0) {
    return (
      <Card className="!p-4 mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nenhum chopp com estoque ativo.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {summaries.map((item) => (
        <Card key={item.productId} className="!p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase truncate">
            {item.productName}
          </p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {item.totalAvailable.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}{" "}
            <span className="text-sm font-normal text-gray-500">L</span>
          </p>
        </Card>
      ))}
    </div>
  );
}
