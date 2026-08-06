import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { isFeatureEnabled } from "../config/features";
import { getTheme, toggleTheme, AppTheme } from "../utils/theme";
import Button from "./Button";

const iconStyles =
  "h-6 w-6 mr-4 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors duration-200";

const DashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={iconStyles}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);
const FinancialIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={iconStyles}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M13 12h7m0 0l-3-3m3 3l-3 3"
    />
  </svg>
);
const CategoriesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={iconStyles}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
);
const EventsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={iconStyles}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const StockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={iconStyles}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
    />
  </svg>
);
const ProductsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={iconStyles}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);
const BudgetsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={iconStyles}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M9 7h6m-6 4h6m-6 4h4M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
    />
  </svg>
);
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);
const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
    />
  </svg>
);

const navLinkClasses =
  "flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-indigo-700 dark:hover:text-white rounded-md transition-colors duration-200 group";
const activeNavLinkClasses =
  "!bg-indigo-50 !text-indigo-700 dark:!bg-gray-900 dark:!text-white";

const Sidebar = () => {
  const { user, logout } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setThemeState] = useState<AppTheme>(() => getTheme());

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleToggleTheme = () => {
    setThemeState(toggleTheme());
  };

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${navLinkClasses} ${isActive ? activeNavLinkClasses : ""}`;

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-[700px]:block hidden hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 max-[700px]:block hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex flex-col z-20 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out max-[700px]:${isOpen ? "translate-x-0" : "-translate-x-full"} max-[700px]:z-40`}
      >
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Assistant
          </h2>
        </div>

        <nav className="flex-grow px-4 py-4 space-y-2">
          <NavLink
            to="/"
            className={getNavLinkClass}
            onClick={closeSidebar}
            end
          >
            <DashboardIcon /> Dashboard
          </NavLink>
          <NavLink
            to="/financial"
            className={getNavLinkClass}
            onClick={closeSidebar}
          >
            <FinancialIcon /> Financeiro
          </NavLink>
          <NavLink
            to="/categories"
            className={getNavLinkClass}
            onClick={closeSidebar}
          >
            <CategoriesIcon /> Categorias
          </NavLink>
          <NavLink
            to="/events"
            className={getNavLinkClass}
            onClick={closeSidebar}
          >
            <EventsIcon /> Eventos
          </NavLink>
          <NavLink
            to="/products"
            className={getNavLinkClass}
            onClick={closeSidebar}
          >
            <ProductsIcon /> Produtos
          </NavLink>
          {isFeatureEnabled("budgets") ? (
            <NavLink
              to="/budgets"
              className={getNavLinkClass}
              onClick={closeSidebar}
            >
              <BudgetsIcon /> Orçamentos
            </NavLink>
          ) : null}
          <NavLink
            to="/stock"
            end
            className={getNavLinkClass}
            onClick={closeSidebar}
          >
            <StockIcon /> Estoque
          </NavLink>
          <NavLink
            to="/stock/history"
            className={getNavLinkClass}
            onClick={closeSidebar}
          >
            <StockIcon /> Histórico Estoque
          </NavLink>
        </nav>

        <div className="px-4 py-4 mt-auto border-t border-gray-200 dark:border-gray-700 space-y-3">
          <button
            type="button"
            onClick={handleToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={
              theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
            }
          >
            <span>Tema: {theme === "dark" ? "Escuro" : "Claro"}</span>
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <div className="px-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
          <Button onClick={logout} variant="secondary" fullWidth>
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
