"use client";

import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { DISPLAY_PLANS, type SubscriptionPlan } from "@/lib/subscription";
import { StudentPageContainer } from "@/components/student";
import RoleGuard from "@/components/auth/RoleGuard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadGenerationButton } from "@/components/landing/LeadGenerationModal";
import { toast } from "sonner";
import { Lock } from "lucide-react";

type BillingCycle = "6months" | "1year";

const PLUS_PRICE = {
  "6months": { amount: 399000, label: "399.000đ", period: "/6 tháng" },
  "1year": { amount: 599000, label: "599.000đ", period: "/năm" },
} as const;

const PLANS: {
  key: SubscriptionPlan;
  name: string;
  priceLabel: string;
  pricePeriod?: string;
  description: string;
  badge?: string;
  contactSales?: boolean;
}[] = [
    {
      key: "FREE",
      name: "Free",
      priceLabel: "0đ",
      description:
        "Dùng thử cơ bản với 1 lần cho mỗi module AI chính. Chi tiết bị làm mờ.",
    },
    {
      key: "PLUS",
      name: "Plus (AI)",
      priceLabel: PLUS_PRICE["6months"].label,
      pricePeriod: PLUS_PRICE["6months"].period,
      description: "Mở khóa đầy đủ chi tiết AI cho profile & ngành học.",
      badge: "Phổ biến",
    },
    {
      key: "PREMIUM",
      name: "Premium (AI + All Advisors)",
      priceLabel: "Liên hệ",
      description: "Truy cập mọi cố vấn (AS/ACS/ARD) và AI không giới hạn.",
      badge: "Tốt nhất",
      contactSales: true,
    },
  ];

const CHECK = "✓";

export default function StudentPricingPage() {
  const { plan: currentPlan } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("6months");
  const [isUpgradeNoticeOpen, setIsUpgradeNoticeOpen] = useState(false);

  const plusPrice = PLUS_PRICE[billingCycle];

  async function handleUpgrade(targetPlan: SubscriptionPlan) {
    if (targetPlan === "FREE") return;
    if (targetPlan === "PREMIUM") {
      // Liên hệ bán hàng: dùng modal LeadGeneration giống landing
      // (đã được handle bằng LeadGenerationButton trong JSX, nên không làm gì ở đây)
      return;
    }
    // Tạm thời chưa mở nâng cấp trên server: show modal thông báo
    setIsUpgradeNoticeOpen(true);
    return;
    /*
    setLoadingPlan(targetPlan);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: targetPlan, billingCycle }),
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
    */
  }

  return (
    <RoleGuard allowedRoles={["user", "student", "STUDENT"]}>
      <StudentPageContainer>
        <div className="max-w-6xl mx-auto pb-10 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Gói đăng ký Holyann cho học sinh
            </h1>
          </div>

          {/* 6‑month cycle callout */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              Tất cả gói được tính theo chu kỳ 6 tháng
            </span>
            {" — "}
            Tính năng và lượt dùng sẽ được làm mới mỗi 6 tháng.
          </div>

          {/* Billing toggle for Plus (6‑month vs 1‑year) */}
          <div className="flex justify-center">
            <Tabs
              value={billingCycle}
              onValueChange={(v) => setBillingCycle(v as BillingCycle)}
            >
              <TabsList className="grid w-full max-w-[280px] grid-cols-2">
                <TabsTrigger value="6months">6 tháng</TabsTrigger>
                <TabsTrigger value="1year">1 năm</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Plan cards — only Free, Plus, Premium */}
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.filter((p) => DISPLAY_PLANS.includes(p.key)).map((p) => {
              const isCurrent = currentPlan === p.key;
              const isUpgradable =
                !isCurrent && p.key !== "FREE" && !p.contactSales;
              const isContactSales = p.contactSales;
              const priceLabel =
                p.key === "PLUS" ? plusPrice.label : p.priceLabel;
              const pricePeriod =
                p.key === "PLUS" ? plusPrice.period : p.pricePeriod;

              return (
                <Card
                  key={p.key}
                  className={
                    p.key === "PREMIUM" ? "border-primary/60 shadow-md" : ""
                  }
                >
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      {p.badge && (
                        <Badge
                          variant={
                            p.key === "PREMIUM" ? "default" : "secondary"
                          }
                          className="text-[10px] px-2 py-0.5"
                        >
                          {p.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-semibold">
                        {priceLabel}
                      </span>
                      {pricePeriod && (
                        <span className="text-xs text-muted-foreground">
                          {pricePeriod}
                        </span>
                      )}
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
                    ) : isContactSales ? (
                      <LeadGenerationButton className="w-full">
                        Liên hệ bán hàng
                      </LeadGenerationButton>
                    ) : isUpgradable ? (
                      <Button
                        className="w-full"
                        onClick={() => handleUpgrade(p.key)}
                        disabled={loadingPlan === p.key}
                      >
                        {loadingPlan === p.key ? "Đang xử lý..." : "Nâng cấp"}
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

          {/* Comparison table — 3 columns: Free, Plus, Premium */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              So sánh chi tiết 6 Feature AI
            </h2>
            <div className="overflow-x-auto rounded-lg border">
              <Table className="min-w-[640px] text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-56">Tính năng</TableHead>
                    <TableHead>Free</TableHead>
                    <TableHead>Plus</TableHead>
                    <TableHead>Premium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Feature 1 — Profile Analysis */}
                  <TableRow>
                    <TableCell colSpan={4} className="font-medium bg-muted">
                      Feature 1 — Profile Analysis
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Phân tích profile gốc</TableCell>
                    <TableCell>
                      1 lần (điểm + phân tích SWOT, vùng/trường phù hợp, chi tiết mờ) <br />
                      Đề xuất hướng cải thiện, lộ trình chung của từng tháng
                    </TableCell>
                    <TableCell>10 lần đầy đủ</TableCell>
                    <TableCell>10 lần đầy đủ</TableCell>
                  </TableRow>

                  {/* Feature 2 — Career Quiz → Major Matching */}
                  <TableRow>
                    <TableCell colSpan={4} className="font-medium bg-muted">
                      Feature 2 — Trắc nghiệm → Ngành
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Làm trắc nghiệm</TableCell>
                    <TableCell>
                      1 lần (chỉ 3 ngành, % mờ; làm lại sau 6 tháng)
                    </TableCell>
                    <TableCell>1 lần — 10 ngành, đầy đủ</TableCell>
                    <TableCell>1 lần — 10 ngành, đầy đủ</TableCell>
                  </TableRow>

                  {/* Feature 3 — Reach / Match / Safe */}
                  <TableRow>
                    <TableCell colSpan={4} className="font-medium bg-muted">
                      Feature 3 — Reach / Match / Safe
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Số lần sử dụng</TableCell>
                    <TableCell>1 lần tổng</TableCell>
                    <TableCell>15 lần / 6 tháng</TableCell>
                    <TableCell>15 lần / 6 tháng</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ngành/trường phù hợp hiển thị</TableCell>
                    <TableCell>5 ngành (1R, 2M, 2S)</TableCell>
                    <TableCell>30 (10R, 10M, 10S)</TableCell>
                    <TableCell>30 (10R, 10M, 10S)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Match score chi tiết</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Mờ
                      </span>
                    </TableCell>
                    <TableCell>{CHECK}</TableCell>
                    <TableCell>{CHECK}</TableCell>
                  </TableRow>

                  {/* Feature 1 — Profile; Feature 4 — CV/Essay */}
                  <TableRow>
                    <TableCell colSpan={4} className="font-medium bg-muted">
                      Profile (Feature 1) &amp; CV/Essay (Feature 4)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      Profile: đánh giá + cải thiện (Feature 1)
                    </TableCell>
                    <TableCell>1 lần / gói Free (mờ)</TableCell>
                    <TableCell>5 đánh giá + 5 cải thiện</TableCell>
                    <TableCell>Không giới hạn</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CV: upload + enhance + analysis</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Lock className="h-3 w-3" /> 1 upload (khóa) + 1 enhance
                        + 1 analysis
                      </span>
                    </TableCell>
                    <TableCell>
                      1 upload (khóa) + 10 enhance + 10 analysis
                    </TableCell>
                    <TableCell>Không giới hạn</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Essay: enhance + analysis</TableCell>
                    <TableCell>1 enhance + 1 analysis</TableCell>
                    <TableCell>10 enhance + 10 analysis</TableCell>
                    <TableCell>Không giới hạn + mentor</TableCell>
                  </TableRow>

                  {/* Feature 5 — School List */}
                  <TableRow>
                    <TableCell colSpan={4} className="font-medium bg-muted">
                      Feature 5 — Danh sách trường
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Hiển thị danh sách các trường</TableCell>
                    <TableCell>Miễn phí</TableCell>
                    <TableCell>Miễn phí</TableCell>
                    <TableCell>Miễn phí</TableCell>
                  </TableRow>

                  {/* Feature 6 — Reports */}
                  <TableRow>
                    <TableCell colSpan={4} className="font-medium bg-muted">
                      Feature 6 — Reports
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Báo cáo tổng hợp (PDF / in)</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <Lock className="h-3 w-3" /> 1 lần
                      </span>
                    </TableCell>
                    <TableCell>Không giới hạn</TableCell>
                    <TableCell>Không giới hạn</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Modal thông báo nâng cấp đang được cập nhật trên server */}
          <Dialog
            open={isUpgradeNoticeOpen}
            onOpenChange={setIsUpgradeNoticeOpen}
          >
            <DialogContent className="sm:max-w-[420px] p-4">
              <DialogHeader>
                <DialogTitle>Hệ thống nâng cấp đang được cập nhật</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Tính năng nâng cấp gói sẽ sớm được mở trên server. Trong thời
                gian này, nếu bạn cần tư vấn nâng cấp, hãy dùng nút &quot;Liên
                hệ bán hàng&quot; để để lại thông tin cho đội ngũ Holyann.
              </p>
            </DialogContent>
          </Dialog>
        </div>
      </StudentPageContainer>
    </RoleGuard>
  );
}
