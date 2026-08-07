import React from "react";
import Button from "../../../shared/components/Button";
import Card from "../../../shared/components/Card";
import ListSkeleton from "../../../shared/components/ListSkeleton";
import PageHeader from "../../../shared/components/PageHeader";
import { getServiceTypeConfig } from "../../../shared/services/budgets/budget.config";
import { formatCurrency, formatLiters } from "../../../shared/services/budgets/format";
import { formatDateBR } from "../../../shared/utils/formatDate";
import BudgetListCard from "./components/BudgetListCard";
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
  isEditing,
  wizardKey,
  onStartCreate,
  onCancelWizard,
  onFinalize,
  onBackToList,
  onEdit,
  onConclude,
  onDelete,
}: IBudgetsPresentationProps) {
  if (mode === "create" || mode === "edit") {
    return (
      <div className="lg:p-6 lg:max-w-6xl lg:mx-auto">
        <BudgetWizard
          key={wizardKey}
          formMethods={formMethods}
          products={products}
          calculation={calculation}
          isLoading={isSaving}
          isEditing={isEditing}
          onCancel={onCancelWizard}
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
            <p className="text-sm text-gray-500">
              Evento: {formatDateBR(lastSaved.eventDate)} ·{" "}
              {lastSaved.clientCity}
            </p>
            <p className="text-3xl font-bold text-indigo-600">
              {formatCurrency(lastSaved.finalTotal)}
            </p>
            <p className="text-sm text-gray-500">
              {formatLiters(
                lastSaved.calculation?.wasLitersAdjusted &&
                  lastSaved.calculation.correctedLiters != null
                  ? lastSaved.calculation.correctedLiters
                  : lastSaved.calculation.suppliedLiters ??
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
        <Card className="!p-0 overflow-hidden">
          <ListSkeleton variant="cards" rows={4} />
        </Card>
      ) : budgets.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500 p-2">
            Nenhum orçamento ainda. Crie o primeiro para enviar ao cliente.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => (
            <BudgetListCard
              key={budget.id}
              budget={budget}
              onEdit={onEdit}
              onConclude={onConclude}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
