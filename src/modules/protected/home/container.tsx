import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "../../../shared/hooks/useSession";
import HomePresentation from "./presentation";
import { IHomePresentationProps, IDashboardData } from "./types";
import { DashboardService } from "../../../shared/services/dashboard/dashboard.service";
import {
  DashboardPeriodKey,
  DateRange,
  getPeriodRange,
} from "../../../shared/utils/periodRange";

const dashboardService = new DashboardService();

export default function HomeContainer() {
  const { user } = useSession();
  const [dashboardData, setDashboardData] = useState<IDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodKey, setPeriodKey] = useState<DashboardPeriodKey>("cycle");
  const [customRange, setCustomRange] = useState<DateRange>(() => getPeriodRange("cycle"));

  const periodRange =
    periodKey === "custom" ? customRange : getPeriodRange(periodKey);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getDashboardData(periodRange);
        if (!cancelled) setDashboardData(data);
      } catch (err) {
        if (!cancelled) {
          setError("Erro ao carregar dados do dashboard. Tente novamente.");
          console.error("Dashboard loading error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [periodRange.startDate, periodRange.endDate]);

  const handlePeriodKeyChange = useCallback((key: DashboardPeriodKey) => {
    setPeriodKey(key);
    if (key !== "custom") {
      setCustomRange(getPeriodRange(key));
    }
  }, []);

  const handleCustomRangeChange = useCallback(
    (field: "startDate" | "endDate", value: string) => {
      setPeriodKey("custom");
      setCustomRange((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const presentationProps: IHomePresentationProps = {
    dashboardData,
    userName: user?.name,
    loading,
    error,
    periodKey,
    periodRange,
    customRange,
    onPeriodKeyChange: handlePeriodKeyChange,
    onCustomRangeChange: handleCustomRangeChange,
  };

  return <HomePresentation {...presentationProps} />;
}
