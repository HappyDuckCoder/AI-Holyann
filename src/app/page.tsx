// src/app/page.tsx
import React from 'react';

// Import các thành phần Layout (Dùng đường dẫn tương đối ../ để tránh lỗi)
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

// Import các Section nội dung
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import HighlightsSection from '../components/landing/HighlightsSection';
import AchievementsSection from '../components/landing/AchievementsSection';
import ServicesSection from '../components/landing/ServicesSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';

export default function Home() {
    return (
        <main className="font-sans text-slate-600 bg-white selection:bg-blue-100 min-h-screen flex flex-col">
            {/* 1. Thanh điều hướng trên cùng */}
            <Header/>

            {/* 2. Các phần nội dung chính */}
            <div className="flex-grow">
                <HeroSection/>
                <AboutSection/>
                <HighlightsSection/>
                <AchievementsSection/>
                <ServicesSection/>
                <TestimonialsSection/>
            </div>

            {/* 3. Chân trang */}
            <Footer/>
        </main>
    );
}