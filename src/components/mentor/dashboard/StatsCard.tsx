import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type IconVariant = 'primary' | 'secondary' | 'accent';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: IconVariant;
  suffix?: string;
}

const variantStyles: Record<IconVariant, { bg: string; icon: string }> = {
  primary: { bg: 'bg-primary/10', icon: 'text-primary' },
  secondary: { bg: 'bg-secondary/20 dark:bg-secondary/30', icon: 'text-secondary-foreground' },
  accent: { bg: 'bg-accent/20 dark:bg-accent/30', icon: 'text-accent-foreground' },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  variant = 'primary',
  suffix = '',
}: StatsCardProps) {
  const style = variantStyles[variant];
  return (
    <Card className="border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {value}
              {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
            </p>
          </div>
          <div className={`rounded-full p-3 ${style.bg}`}>
            <Icon className={`h-6 w-6 shrink-0 ${style.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
