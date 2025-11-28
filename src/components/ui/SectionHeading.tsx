import React from 'react';
import {BRAND_COLORS} from '../../lib/data';

export default function SectionHeading({children, subtitle}: { children: React.ReactNode, subtitle?: string }) {
    return (
        <div className="text-center mb-12">
            {subtitle && (
                <span className={`uppercase tracking-wider font-bold text-sm mb-2 block ${BRAND_COLORS.textGradient}`}>
          {subtitle}
        </span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{children}</h2>
            <div className="w-20 h-1 bg-[#0072ff] mx-auto mt-4 rounded-full"></div>
        </div>
    );
}