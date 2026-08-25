import React from "react";

import Button from "../../../shared/components/Button";

import Card from "../../../shared/components/Card";

import ListSkeleton from "../../../shared/components/ListSkeleton";

import PageHeader from "../../../shared/components/PageHeader";

import BudgetListCard from "./components/BudgetListCard";

import BudgetWizard from "./components/BudgetWizard";

import { IBudgetsPresentationProps } from "./types";



export default function BudgetsPresentation({

  mode,

  budgets,

  products,

  formMethods,

  calculation,

  isLoading,

  isSaving,

  isEditing,

  wizardKey,

  onStartCreate,

  onCancelWizard,

  onFinalize,

  onEdit,

  onConclude,

  onReopen,

  onGenerateContract,

  onDownload,

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

              onReopen={onReopen}

              onGenerateContract={onGenerateContract}

              onDownload={onDownload}

              onDelete={onDelete}

            />

          ))}

        </div>

      )}

    </div>

  );

}

