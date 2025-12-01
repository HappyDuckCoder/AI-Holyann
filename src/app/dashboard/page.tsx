"use client";
import React, {useState} from 'react';
import AuthHeader from '@/components/dashboard/AuthHeader';
import DashboardComponent from '@/components/dashboard/Dashboard';
import Login from '@/components/dashboard/Login';
import Register from '@/components/dashboard/Register';
import {useAuth} from '@/contexts/AuthContext';

export default function DashboardPage() {
    const {isAuthenticated, login} = useAuth();
    const [currentView, setCurrentView] = useState<'dashboard' | 'login' | 'register'>('dashboard');

    const handleLogin = (email: string, name: string) => {
        login(email, name);
        setCurrentView('dashboard');
    };

    const handleRegister = (email: string, name: string) => {
        login(email, name);
        setCurrentView('dashboard');
    };

    return (
        <div
            className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
            {/* 1. Auth Header */}
            <AuthHeader/>

            {/* 2. Main Content Area */}
            <div className="py-8 px-4">
                {isAuthenticated ? (
                    // Hiển thị Dashboard khi đã đăng nhập
                    <div className="flex justify-center">
                        <DashboardComponent userName="Người dùng"/>
                    </div>
                ) : currentView === 'login' ? (
                    // Hiển thị Login form
                    <div className="flex justify-center">
                        <Login onLogin={handleLogin}/>
                    </div>
                ) : currentView === 'register' ? (
                    // Hiển thị Register form
                    <div className="flex justify-center">
                        <Register onRegister={handleRegister}/>
                    </div>
                ) : (
                    // Hiển thị Dashboard mặc định (khi chưa đăng nhập)
                    <div className="flex justify-center">
                        <DashboardComponent userName="Khách"/>
                    </div>
                )}
            </div>
        </div>
    );
}

