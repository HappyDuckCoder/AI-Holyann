'use client';

import { useState } from 'react';
import DeadlineManagementTab from './DeadlineManagementTab';
import ChecklistTab from './ChecklistTab';
import EssayTab from './EssayTab';

interface StudentTabsProps {
  studentId: string;
}

type TabType = 'checklist' | 'deadlines' | 'essay';

export default function StudentTabs({ studentId }: StudentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('checklist');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'checklist', label: 'Tiến độ Checklist' },
    { id: 'deadlines', label: 'Tiến độ & Deadline' },
    { id: 'essay', label: 'Essay' },
  ];

  return (
    <>
      <div className="border-b border-border bg-muted/30">
        <nav className="flex gap-6 overflow-x-auto px-4 sm:px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 sm:p-6">
        {activeTab === 'checklist' && <ChecklistTab studentId={studentId} />}
        {activeTab === 'deadlines' && <DeadlineManagementTab studentId={studentId} />}
        {activeTab === 'essay' && <EssayTab studentId={studentId} />}
      </div>
    </>
  );
}
