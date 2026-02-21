import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const ProtectedLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 ml-64 max-[700px]:ml-0 max-[700px]:mt-10">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
