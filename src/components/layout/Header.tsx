"use client";
import React, {useState} from 'react';
import {Menu, X} from 'lucide-react';
import {NAV_LINKS, BRAND_COLORS} from '../../lib/data';
import Image from 'next/image';

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
            <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <Image
                        src="/images/logos/Logo_Holyann_ngang-removebg-preview.png"
                        alt="Holyann Logo"
                        width={150}
                        height={40}
                        className="cursor-pointer"
                    />
                </div>

                {/* Desktop Menu */}
                <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
                    {NAV_LINKS.map((link) => (
                        <a key={link.name} href={link.href}
                           className="hover:text-[#0072ff] transition-colors uppercase text-xs tracking-wide">
                            {link.name}
                        </a>
                    ))}
                </nav>

                {/* CTA & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <a href="#contact"
                       className={`hidden md:block px-6 py-2.5 rounded-full text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 ${BRAND_COLORS.primaryGradient}`}>
                        Đăng Ký Tư Vấn
                    </a>
                    <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X/> : <Menu/>}
                    </button>
                </div>
            </div>

            {/* Mobile Menu logic... (giữ nguyên như code cũ nhưng đặt vào đây) */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden bg-white border-t border-slate-100 absolute w-full p-4 flex flex-col gap-4 shadow-xl h-screen">
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="block text-slate-800 font-medium py-3 border-b border-slate-50 text-lg"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>
            )}
        </header>
    );
}