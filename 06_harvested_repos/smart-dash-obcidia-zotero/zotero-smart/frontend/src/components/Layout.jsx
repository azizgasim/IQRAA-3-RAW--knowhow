/**
 * Layout - التخطيط الرئيسي
 */

import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Home, Library, FolderTree, Search, Upload,
  BarChart3, Settings, Menu, X, Plus, Moon, Sun,
  BookOpen
} from 'lucide-react';
import { useStore } from '../store/useStore';

const navigation = [
  { name: 'الرئيسية', href: '/', icon: Home },
  { name: 'المكتبة', href: '/library', icon: Library },
  { name: 'المجموعات', href: '/collections', icon: FolderTree },
  { name: 'البحث', href: '/search', icon: Search },
  { name: 'الاستيراد', href: '/import', icon: Upload },
  { name: 'الإحصائيات', href: '/stats', icon: BarChart3 },
  { name: 'الإعدادات', href: '/settings', icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useStore();
  const location = useLocation();

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-64 transform bg-white dark:bg-gray-800 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:right-0">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <SidebarContent />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 lg:mr-64">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>

              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {navigation.find((n) => {
                  if (n.href === '/') return location.pathname === '/';
                  return location.pathname.startsWith(n.href);
                })?.name || 'زوتيرو الذكي'}
              </h1>

              <div className="flex items-center gap-2">
                <NavLink
                  to="/references/new"
                  className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-lg"
                  title="مرجع جديد"
                >
                  <Plus className="h-5 w-5" />
                </NavLink>

                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">زوتيرو الذكي</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">إدارة المراجع</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.href);

          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <BookOpen className="h-4 w-4" />
          <span>جزء من منصة إقرأ</span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">v1.0.0</p>
      </div>
    </>
  );
}
