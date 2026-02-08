import React from 'react';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import TestCard from './TestCard';
import { TestType, TestResult } from '../types';
import { TEST_DESCRIPTIONS } from '@/constants';

interface TestSelectionProps {
  onStartTest: (type: TestType) => void;
  onViewResult: (type: TestType) => void;
  // onResetTest?: (type: TestType) => void; // Đã comment - bỏ nút Làm lại RIASEC
  completedTests?: TestType[];
  testResults?: Partial<Record<TestType, TestResult>>;
  onViewRecommendations?: () => void;
}

const TestSelection: React.FC<TestSelectionProps> = ({
  onStartTest,
  onViewResult,
  completedTests = [],
  testResults = {},
  onViewRecommendations,
}) => {
  const allCompleted = completedTests.length >= 3;
  const completedCount = completedTests.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Khám phá bản thân
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Hoàn thành: <span className="font-semibold text-primary">{completedCount}/3</span>
          </span>
          {completedCount > 0 && (
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${i <= completedCount ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TestCard
          title={TEST_DESCRIPTIONS.MBTI.title}
          description={TEST_DESCRIPTIONS.MBTI.desc}
          colorClass={TEST_DESCRIPTIONS.MBTI.color}
          iconType="MBTI"
          onClick={() => onStartTest('MBTI')}
          onViewResult={() => onViewResult('MBTI')}
          isCompleted={completedTests.includes('MBTI')}
          result={testResults['MBTI']}
        />
        <TestCard
          title={TEST_DESCRIPTIONS.GRIT.title}
          description={TEST_DESCRIPTIONS.GRIT.desc}
          colorClass={TEST_DESCRIPTIONS.GRIT.color}
          iconType="GRIT"
          onClick={() => onStartTest('GRIT')}
          onViewResult={() => onViewResult('GRIT')}
          isCompleted={completedTests.includes('GRIT')}
          result={testResults['GRIT']}
        />
        <TestCard
          title={TEST_DESCRIPTIONS.RIASEC.title}
          description={TEST_DESCRIPTIONS.RIASEC.desc}
          colorClass={TEST_DESCRIPTIONS.RIASEC.color}
          iconType="RIASEC"
          onClick={() => onStartTest('RIASEC')}
          onViewResult={() => onViewResult('RIASEC')}
          isCompleted={completedTests.includes('RIASEC')}
          result={testResults['RIASEC']}
        />
      </div>

      {allCompleted && onViewRecommendations && (
        <div
          className="relative rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden
            bg-gradient-to-br from-primary/[0.06] via-transparent to-primary/[0.04]"
        >
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-6 p-6 md:p-8">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">
                  Đề xuất nghề nghiệp
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                  Dựa trên kết quả MBTI, GRIT và Holland, chúng tôi phân tích và đề xuất những nghề nghiệp phù hợp nhất với bạn.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onViewRecommendations}
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold py-3 px-6
                hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm hover:shadow"
            >
              Xem đề xuất nghề nghiệp
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSelection;
