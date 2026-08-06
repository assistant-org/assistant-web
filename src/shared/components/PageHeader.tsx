import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Filter controls — rendered before actions, left of the right cluster */
  filters?: React.ReactNode;
  /** Primary actions — always right-aligned */
  actions?: React.ReactNode;
  /** Extra content under the filter/actions row (e.g. date range on Home) */
  belowToolbar?: React.ReactNode;
}

/**
 * Sticky page header: title + subtitle, then filters (left of actions) + actions (right).
 * Keeps title/toolbar visible while the list scrolls underneath.
 * On mobile, extra left padding clears the fixed sidebar menu button.
 */
export default function PageHeader({
  title,
  subtitle,
  filters,
  actions,
  belowToolbar,
}: PageHeaderProps) {
  const hasToolbar = Boolean(filters || actions);

  return (
    <div className="sticky top-0 z-10 -mx-6 px-6 max-[700px]:pl-16 pt-1 pb-4 mb-4 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-transparent">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          ) : null}
        </div>

        {hasToolbar ? (
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            {filters}
            {actions}
          </div>
        ) : null}
      </div>
      {belowToolbar}
    </div>
  );
}
