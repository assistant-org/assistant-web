import React, { useState, useEffect } from "react";
import { useSession } from "../../../shared/hooks/useSession";
import HomePresentation from "./presentation";
import { IHomePresentationProps, IDashboardData } from "./types";
import { DashboardService } from "../../../shared/services/dashboard/dashboard.service";

const dashboardService = new DashboardService();

export default function HomeContainer() {
  const { user } = useSession();
  const [dashboardData, setDashboardData] = useState<IDashboardData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getDashboardData();
        if (!cancelled) {
          setDashboardData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Erro ao carregar dados do dashboard. Tente novamente.");
          console.error("Dashboard loading error:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const presentationProps: IHomePresentationProps = {
    dashboardData,
    userName: user?.name,
    loading,
    error,
  };

  return <HomePresentation {...presentationProps} />;
}
