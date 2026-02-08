import React from "react";
import { Info } from "lucide-react";

// Component hiển thị thông tin về dataset O*NET được sử dụng
// để đưa ra các gợi ý nghề nghiệp
export function ONETDatasetInfo() {
  return (
    <div className="mb-6 rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Info className="w-5 h-5 text-primary mt-0.5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            📊 Thông tin về dữ liệu nghề nghiệp
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Các gợi ý nghề nghiệp được tạo ra dựa trên{" "}
            <span className="font-semibold text-foreground">O*NET Database</span> - cơ sở dữ
            liệu nghề nghiệp toàn diện nhất của Hoa Kỳ, được phát triển bởi Bộ
            Lao động Mỹ (U.S. Department of Labor). O*NET chứa thông tin chi
            tiết về hơn 1,000 nghề nghiệp, bao gồm kỹ năng, kiến thức, năng lực
            và đặc điểm tính cách phù hợp cho từng nghề nghiệp.
          </p>
          <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-1.5" />
              1,000+ nghề nghiệp
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-primary/70 rounded-full mr-1.5" />
              RIASEC Compatible
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-primary/50 rounded-full mr-1.5" />
              Updated 2025
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
