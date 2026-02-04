import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import Button from './Button';

const iconStyles = "h-6 w-6 mr-4 text-gray-400 group-hover:text-white transition-colors duration-200";

const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const EntriesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const OutputsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CategoriesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>;
const EventsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const StockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;

const navLinkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 group";
const activeNavLinkClasses = "!bg-gray-900 !text-white";

const Sidebar = () => {
  const { user, logout } = useSession();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`;

  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-gray-800 text-white flex flex-col z-10 shadow-lg">
      <div className="px-6 py-5 border-b border-gray-700">
        <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
      </div>

      <nav className="flex-grow px-4 py-4 space-y-2">
        <NavLink to="/" className={getNavLinkClass} end><DashboardIcon /> Dashboard</NavLink>
        <NavLink to="/entries" className={getNavLinkClass}><EntriesIcon /> Entradas</NavLink>
        <NavLink to="/outputs" className={getNavLinkClass}><OutputsIcon /> Saídas</NavLink>
        <NavLink to="/categories" className={getNavLinkClass}><CategoriesIcon /> Categorias</NavLink>
        <NavLink to="/events" className={getNavLinkClass}><EventsIcon /> Eventos</NavLink>
        <NavLink to="/stock" className={getNavLinkClass}><StockIcon /> Estoque</NavLink>
      </nav>

      <div className="px-4 py-4 mt-auto border-t border-gray-700">
        <div className="mb-4 px-2">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
        <Button onClick={logout} variant="secondary" fullWidth>Logout</Button>
      </div>
    </aside>
  );
}

export default Sidebar;
