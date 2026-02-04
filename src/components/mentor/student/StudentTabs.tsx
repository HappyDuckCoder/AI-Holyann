'use client';

import { useState } from 'react';
import SchoolListTab from './SchoolListTab';
import DeadlineManagementTab from './DeadlineManagementTab';

interface StudentTabsProps {
  studentId: string;
}

type TabType = 'schools' | 'deadlines';

export default function StudentTabs({ studentId }: StudentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('deadlines');

  const tabs = [
    { id: 'schools' as TabType, label: 'Danh sách trường' },
    { id: 'deadlines' as TabType, label: 'Tiến độ & Deadline' },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-[#0f4c81] text-[#0f4c81]'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'schools' && <SchoolListTab studentId={studentId} />}
        {activeTab === 'deadlines' && <DeadlineManagementTab studentId={studentId} />}
      </div>
    </div>
  );
}
