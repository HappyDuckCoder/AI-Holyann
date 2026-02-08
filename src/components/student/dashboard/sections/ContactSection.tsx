"use client";

import { MapPin, Phone, Mail } from "lucide-react";

export default function ContactSection() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
        <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-foreground">Địa chỉ</p>
          <p className="text-xs text-muted-foreground">
            Tầng 12, Tòa nhà TechHub, 11 Duy Tân, Cầu Giấy, HN
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
        <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-foreground">Hotline</p>
          <p className="text-xs text-muted-foreground">1900 123 456</p>
        </div>
      </div>
      <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
        <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-foreground">Email</p>
          <p className="text-xs text-muted-foreground">support@holyann.vn</p>
        </div>
      </div>
    </div>
  );
}
