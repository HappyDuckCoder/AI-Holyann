'use client';

import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { StudentPageContainer } from '@/components/student';
import RoleGuard from '@/components/auth/RoleGuard';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

type PlanKey = 'FREE' | 'PLUS' | 'ADVANCED' | 'PREMIUM';

const PLANS: {
  key: PlanKey;
  name: string;
  priceLabel: string;
  description: string;
  badge?: string;
}[] = [
  {
    key: 'FREE',
    name: 'Free',
    priceLabel: '0đ',
    description: 'Dùng thử cơ bản với 1 lần cho mỗi module AI chính.',
  },
  {
    key: 'PLUS',
    name: 'Plus (AI)',
    priceLabel: '$10',
    description: 'Mở khóa đầy đủ chi tiết AI cho profile & ngành học.',
    badge: 'Phổ biến',
  },
  {
    key: 'ADVANCED',
    name: 'Advanced (AI + Advisor ACS)',
    priceLabel: '$20',
    description: 'Thêm cố vấn ACS cho luận & hồ sơ học thuật.',
    badge: 'Học thuật chuyên sâu',
  },
  {
    key: 'PREMIUM',
    name: 'Premium (AI + All Advisors)',
    priceLabel: '$30',
    description: 'Truy cập mọi cố vấn (AS/ACS/ARD) và AI không giới hạn.',
    badge: 'Tốt nhất',
  },
];

const CHECK = '✓';
const LOCK = '🔒';

export default function StudentPricingPage() {
  const { plan: currentPlan } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  async function handleUpgrade(targetPlan: PlanKey) {
    if (targetPlan === 'FREE') return;
    setLoadingPlan(targetPlan);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.error || 'Không thể nâng cấp gói, vui lòng thử lại');
        return;
      }
      toast.success(`Đã nâng cấp lên gói ${targetPlan}`);
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <RoleGuard allowedRoles={['user', 'student', 'STUDENT']}>
      <StudentPageContainer>
        <div className="max-w-6xl mx-auto pb-10 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Gói đăng ký Holyann cho học sinh</h1>
            <p className="text-sm text-muted-foreground">
              Chỉ chia gói đối với AI. Các tính năng nền tảng (danh sách trường, checklist, chat với mentor được chỉ định)
              vẫn miễn phí.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {PLANS.map((p) => {
              const isCurrent = currentPlan === p.key;
              const isUpgradable = !isCurrent && p.key !== 'FREE';
              return (
                <Card key={p.key} className={p.key === 'PREMIUM' ? 'border-primary/60 shadow-md' : ''}>
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      {p.badge && (
                        <Badge
                          variant={p.key === 'PREMIUM' ? 'default' : 'secondary'}
                          className="text-[10px] px-2 py-0.5"
                        >
                          {p.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-semibold">{p.priceLabel}</span>
                      {p.key !== 'FREE' && <span className="text-xs text-muted-foreground">/tháng</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    <p>{p.description}</p>
                  </CardContent>
                  <CardFooter>
                    {isCurrent ? (
                      <Button className="w-full" variant="outline" disabled>
                        Gói hiện tại
                      </Button>
                    ) : isUpgradable ? (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(p.key)}
                        disabled={loadingPlan === p.key}
                      >
                        {loadingPlan === p.key ? 'Đang xử lý...' : 'Nâng cấp'}
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        Mặc định
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">So sánh chi tiết 6 Feature AI</h2>
            <div className="overflow-x-auto rounded-lg border">
              <Table className="min-w-[720px] text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-56">Tính năng</TableHead>
                    <TableHead>Free</TableHead>
                    <TableHead>Plus</TableHead>
                    <TableHead>Advanced</TableHead>
                    <TableHead>Premium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Feature 1 — Profile Analysis */}
                  <TableRow>
                    <TableCell colSpan={5} className="font-medium bg-muted">
                      Feature 1 — Profile Analysis
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phân tích profile gốc</TableCell>
                    <TableCell>1 lần (mờ detail)</TableCell>
                    <TableCell>1 lần đầy đủ</TableCell>
                    <TableCell>1 lần đầy đủ</TableCell>
                    <TableCell>1 lần đầy đủ</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Lưu profile &amp; nhận xét</TableCell>
                    <TableCell>
                      {LOCK} {LOCK && 'Không lưu chi tiết'}
                    </TableCell>
                    <TableCell>{CHECK}</TableCell>
                    <TableCell>{CHECK}</TableCell>
                    <TableCell>{CHECK}</TableCell>
                  </TableRow>

                  {/* Feature 2 — Trắc nghiệm → Ngành */}
                  <TableRow>
                    <TableCell colSpan={5} className="font-medium bg-muted">
                      Feature 2 — Trắc nghiệm → Ngành
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Làm trắc nghiệm</TableCell>
                    <TableCell>1 lần</TableCell>
                    <TableCell>1 lần</TableCell>
                    <TableCell>1 lần</TableCell>
                    <TableCell>1 lần</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Danh sách ngành</TableCell>
                    <TableCell>3 ngành (mờ % phù hợp)</TableCell>
                    <TableCell>10 ngành full</TableCell>
                    <TableCell>10 ngành full</TableCell>
                    <TableCell>10 ngành full</TableCell>
                  </TableRow>

                  {/* Feature 3 — Reach / Match / Safe */}
                  <TableRow>
                    <TableCell colSpan={5} className="font-medium bg-muted">
                      Feature 3 — Reach / Match / Safe
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phân loại Reach / Match / Safe</TableCell>
                    <TableCell>5 ngành (1R/2M/2S, mờ dưới)</TableCell>
                    <TableCell>9 ngành chi tiết</TableCell>
                    <TableCell>9 ngành chi tiết</TableCell>
                    <TableCell>9 ngành chi tiết</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sự phù hợp từng ngành</TableCell>
                    <TableCell>1 ngành cao nhất {LOCK}</TableCell>
                    <TableCell>3 ngành cao nhất {LOCK}</TableCell>
                    <TableCell>5 ngành cao nhất</TableCell>
                    <TableCell>9 ngành cao nhất</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Match score chi tiết</TableCell>
                    <TableCell>Mờ {LOCK}</TableCell>
                    <TableCell>{CHECK}</TableCell>
                    <TableCell>{CHECK}</TableCell>
                    <TableCell>{CHECK}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Roadmap cải thiện</TableCell>
                    <TableCell>Chung chung {LOCK}</TableCell>
                    <TableCell>Chi tiết</TableCell>
                    <TableCell>Chi tiết</TableCell>
                    <TableCell>Chi tiết</TableCell>
                  </TableRow>

                  {/* Feature 4 — Enhance & Re-analysis */}
                  <TableRow>
                    <TableCell colSpan={5} className="font-medium bg-muted">
                      Feature 4 — Enhance &amp; Re-analysis
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Enhance profile &amp; phân tích lại</TableCell>
                    <TableCell>1 lần enhance + 1 analysis {LOCK}</TableCell>
                    <TableCell>5 lần enhance + 5 analysis</TableCell>
                    <TableCell>5 lần enhance + 5 analysis</TableCell>
                    <TableCell>Không giới hạn</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Analysis CV / Enhance CV</TableCell>
                    <TableCell>1 lần up CV + 1 enhance + 1 analysis</TableCell>
                    <TableCell>1 lần up CV + 5 enhance + 5 analysis</TableCell>
                    <TableCell>1 lần up CV + 5 enhance + 5 analysis</TableCell>
                    <TableCell>Không giới hạn</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Đánh giá &amp; định hướng cải thiện luận</TableCell>
                    <TableCell>1 lần enhance + 1 analysis</TableCell>
                    <TableCell>5 lần enhance + 5 analysis</TableCell>
                    <TableCell>5 lần enhance + 5 analysis + mentor</TableCell>
                    <TableCell>Không giới hạn + mentor</TableCell>
                  </TableRow>

                  {/* Feature 5 — Danh sách trường */}
                  <TableRow>
                    <TableCell colSpan={5} className="font-medium bg-muted">
                      Feature 5 — Danh sách trường
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Hiển thị danh sách các trường</TableCell>
                    <TableCell>Miễn phí</TableCell>
                    <TableCell>Miễn phí</TableCell>
                    <TableCell>Miễn phí</TableCell>
                    <TableCell>Miễn phí</TableCell>
                  </TableRow>

                  {/* Feature 6 — Reports */}
                  <TableRow>
                    <TableCell colSpan={5} className="font-medium bg-muted">
                      Feature 6 — Reports
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Báo cáo tổng hợp (PDF / in)</TableCell>
                    <TableCell>1 lần {LOCK}</TableCell>
                    <TableCell>Không giới hạn</TableCell>
                    <TableCell>Không giới hạn</TableCell>
                    <TableCell>Không giới hạn</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
            </p>
          </div>
        </div>
      </StudentPageContainer>
    </RoleGuard>
  );
}

