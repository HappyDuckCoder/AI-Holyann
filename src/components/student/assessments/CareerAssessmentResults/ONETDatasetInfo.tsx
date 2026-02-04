import React from "react";
import { Info } from "lucide-react";

// Component hiển thị thông tin về dataset O*NET được sử dụng
// để đưa ra các gợi ý nghề nghiệp
export function ONETDatasetInfo() {
  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
            📊 Thông tin về dữ liệu nghề nghiệp
          </h3>
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            Các gợi ý nghề nghiệp được tạo ra dựa trên{" "}
            <span className="font-semibold">O*NET Database</span> - cơ sở dữ
            liệu nghề nghiệp toàn diện nhất của Hoa Kỳ, được phát triển bởi Bộ
            Lao động Mỹ (U.S. Department of Labor). O*NET chứa thông tin chi
            tiết về hơn 1,000 nghề nghiệp, bao gồm kỹ năng, kiến thức, năng lực
            và đặc điểm tính cách phù hợp cho từng nghề nghiệp.
          </p>
          <div className="mt-2 flex items-center space-x-4 text-xs text-blue-700 dark:text-blue-300">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              1,000+ nghề nghiệp
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
              RIASEC Compatible
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-1.5"></span>
              Updated 2025
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
