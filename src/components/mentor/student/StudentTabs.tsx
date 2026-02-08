'use client';

import { useState } from 'react';
import SchoolListTab from './SchoolListTab';
import DeadlineManagementTab from './DeadlineManagementTab';
import ChecklistTab from './ChecklistTab';
import EssayTab from './EssayTab';

interface StudentTabsProps {
  studentId: string;
}

type TabType = 'checklist' | 'schools' | 'deadlines' | 'essay';

export default function StudentTabs({ studentId }: StudentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('checklist');

  const tabs = [
    { id: 'checklist' as TabType, label: 'Tiến độ Checklist' },
    { id: 'schools' as TabType, label: 'Danh sách trường' },
    { id: 'deadlines' as TabType, label: 'Tiến độ & Deadline' },
    { id: 'essay' as TabType, label: 'Essay' },
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
        {activeTab === 'checklist' && <ChecklistTab studentId={studentId} />}
        {activeTab === 'schools' && <SchoolListTab studentId={studentId} />}
        {activeTab === 'deadlines' && <DeadlineManagementTab studentId={studentId} />}
        {activeTab === 'essay' && <EssayTab studentId={studentId} />}
      </div>
    </div>
  );
}
