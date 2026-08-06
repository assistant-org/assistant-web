import React from "react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import PageHeader from "../../../shared/components/PageHeader";
import { getServiceTypeConfig } from "../../../shared/services/budgets/budget.config";
import { formatCurrency, formatLiters } from "../../../shared/services/budgets/format";
import BudgetProposalActions from "./components/BudgetProposalActions";
import BudgetWizard from "./components/BudgetWizard";
import { IBudgetsPresentationProps } from "./types";

export default function BudgetsPresentation({
  mode,
  budgets,
  products,
  formMethods,
  calculation,
  lastSaved,
  isLoading,
  isSaving,
  onStartCreate,
  onCancelCreate,
  onFinalize,
  onBackToList,
  onDelete,
}: IBudgetsPresentationProps) {
  if (mode === "create") {
    return (
      <div className="lg:p-6 lg:max-w-6xl lg:mx-auto">
        <BudgetWizard
          formMethods={formMethods}
          products={products}
          calculation={calculation}
          isLoading={isSaving}
          onCancel={onCancelCreate}
          onFinalize={onFinalize}
        />
      </div>
    );
  }

  if (mode === "done" && lastSaved) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
        <Card>
          <div className="space-y-4 p-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Orçamento gerado
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Proposta para <strong>{lastSaved.clientName}</strong> —{" "}
              {getServiceTypeConfig(lastSaved.serviceType).label}
            </p>
            <p className="text-3xl font-bold text-indigo-600">
              {formatCurrency(lastSaved.finalTotal)}
            </p>
            <p className="text-sm text-gray-500">
              {formatLiters(
                lastSaved.calculation.suppliedLiters ??
                  lastSaved.calculation.requiredLiters ??
                  lastSaved.calculation.totalLiters,
              )}{" "}
              contratados
            </p>
            <BudgetProposalActions budget={lastSaved} />
            <Button type="button" variant="secondary" onClick={onBackToList} fullWidth>
              Voltar à lista
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Orçamentos"
        subtitle="Gere propostas profissionais em poucos minutos"
        actions={
          <Button type="button" onClick={onStartCreate}>
            Novo orçamento
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando…</p>
      ) : budgets.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500 p-2">
            Nenhum orçamento ainda. Crie o primeiro para enviar ao cliente.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <div className="flex flex-wrap items-start justify-between gap-3 p-1">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {budget.clientName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getServiceTypeConfig(budget.serviceType).label} ·{" "}
                    {budget.clientCity} ·{" "}
                    {formatLiters(
                      budget.calculation?.suppliedLiters ??
                        budget.calculation?.requiredLiters ??
                        budget.calculation?.totalLiters ??
                        0,
                    )}
                  </p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">
                    {formatCurrency(budget.finalTotal)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-stretch sm:items-end">
                  <BudgetProposalActions budget={budget} />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onDelete(budget)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
