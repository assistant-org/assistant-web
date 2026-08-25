import React from "react";

import {

  CheckCircle2,

  FileDown,

  FileText,

  Pencil,

  RotateCcw,

  Trash2,

} from "lucide-react";

import ActionMenu from "../../../../shared/components/ActionMenu";

import Card from "../../../../shared/components/Card";

import {

  formatCurrency,

  formatLiters,

} from "../../../../shared/services/budgets/format";

import { Budget } from "../../../../shared/services/budgets/types";

import { formatDateBR } from "../../../../shared/utils/formatDate";



interface BudgetListCardProps {

  budget: Budget;

  onEdit: (budget: Budget) => void;

  onConclude: (budget: Budget) => void;

  onReopen: (budget: Budget) => void;

  onGenerateContract: (budget: Budget) => void;

  onDownload: (budget: Budget) => void;

  onDelete: (budget: Budget) => void;

}



function billingLiters(budget: Budget): number {

  const calc = budget.calculation;

  if (!calc) return 0;

  if (calc.wasLitersAdjusted && calc.correctedLiters != null) {

    return calc.correctedLiters;

  }

  const fromLines = (calc.flavorLines || []).reduce(

    (s, l) => s + (l.liters || 0),

    0,

  );

  if (fromLines > 0) return fromLines;

  return calc.suppliedLiters ?? calc.requiredLiters ?? calc.totalLiters ?? 0;

}



export default function BudgetListCard({

  budget,

  onEdit,

  onConclude,

  onReopen,

  onGenerateContract,

  onDownload,

  onDelete,

}: BudgetListCardProps) {

  const isOpen = budget.status !== "concluded";



  return (

    <Card>

      <div className="flex items-start justify-between gap-3 p-1">

        <div className="min-w-0 flex-1 space-y-1">

          <div className="flex flex-wrap items-center gap-2">

            <p className="font-semibold text-gray-900 dark:text-white truncate">

              {budget.clientName}

            </p>

            <span

              className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${

                isOpen

                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"

                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"

              }`}

            >

              {isOpen ? "Aberto" : "Concluído"}

            </span>

          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">

            Evento: {formatDateBR(budget.eventDate)}

          </p>

          <p className="text-sm text-gray-600 dark:text-gray-300">

            {formatLiters(billingLiters(budget))}

          </p>

          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">

            {formatCurrency(budget.finalTotal)}

          </p>

        </div>



        <ActionMenu

          items={[

            {

              key: "edit",

              label: "Editar",

              icon: <Pencil className="h-4 w-4" />,

              onClick: () => onEdit(budget),

            },

            {

              key: "conclude",

              label: "Concluir",

              icon: <CheckCircle2 className="h-4 w-4" />,

              onClick: () => onConclude(budget),

              disabled: !isOpen,

            },

            {

              key: "contract",

              label: "Gerar contrato",

              icon: <FileText className="h-4 w-4" />,

              onClick: () => onGenerateContract(budget),

            },

            {

              key: "reopen",

              label: "Não concluído",

              icon: <RotateCcw className="h-4 w-4" />,

              onClick: () => onReopen(budget),

              disabled: isOpen,

            },

            {

              key: "download",

              label: "Baixar",

              icon: <FileDown className="h-4 w-4" />,

              onClick: () => onDownload(budget),

            },

            {

              key: "delete",

              label: "Excluir",

              icon: <Trash2 className="h-4 w-4" />,

              onClick: () => onDelete(budget),

              danger: true,

            },

          ]}

        />

      </div>

    </Card>

  );

}

