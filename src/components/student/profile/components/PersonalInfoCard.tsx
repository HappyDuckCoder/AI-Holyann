"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Calendar,
  CalendarDays,
  MapPin,
  Camera,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { StudentProfile } from "../../../types";
import { StatusBadge } from "./StatusBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PersonalInfoCardProps {
  profile: StudentProfile;
  isComplete: boolean;
  onUploadAvatar?: (file: File) => void;
  uploadAvatarLoading?: boolean;
  onSave?: (data: {
    name: string;
    email: string;
    phone: string;
    dob: string;
    address: string;
  }) => void;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  profile,
  isComplete,
  onUploadAvatar,
  uploadAvatarLoading = false,
  onSave,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    dob: profile.dob,
    address: profile.address,
  });

  useEffect(() => {
    setForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      dob: profile.dob,
      address: profile.address,
    });
  }, [
    profile.name,
    profile.email,
    profile.phone,
    profile.dob,
    profile.address,
  ]);

  const hasAvatarUrl =
    profile.avatarUrl &&
    (profile.avatarUrl.startsWith("http") || profile.avatarUrl.startsWith("/"));
  const showImage = Boolean(hasAvatarUrl && !imgError);
  const avatarSrc = hasAvatarUrl ? profile.avatarUrl : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadAvatar) {
      onUploadAvatar(file);
      e.target.value = "";
    }
  };

  const handleSave = () => {
    onSave?.(form);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      dob: profile.dob,
      address: profile.address,
    });
    setEditing(false);
  };

  const initials =
    (form.name || profile.name)
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  // Parse ngày sinh từ chuỗi vi-VN (dd/MM/yyyy) hoặc "Chưa cập nhật"
  const parseDobToDate = (dobStr: string): Date | undefined => {
    if (!dobStr || dobStr === "Chưa cập nhật") return undefined;
    try {
      const d = parse(dobStr.trim(), "dd/MM/yyyy", new Date(), { locale: vi });
      return isNaN(d.getTime()) ? undefined : d;
    } catch {
      return undefined;
    }
  };

  const dobDate = parseDobToDate(form.dob);

  return (
    <div className="rounded-2xl border border-border shadow-sm overflow-hidden border-l-4 border-l-blue-500/60 bg-card bg-gradient-to-br from-blue-500/5 to-transparent">
      <div className="h-20 sm:h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 2L2 14v12l18 12 18-12V14L20 2z' fill='none' stroke='%230f4c81' stroke-width='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 relative">
        <div className="flex flex-col items-center -mt-10 sm:-mt-12 mb-3 sm:mb-4">
          <div
            className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-card overflow-hidden shadow-lg bg-muted"
            onClick={() =>
              onUploadAvatar &&
              !uploadAvatarLoading &&
              inputRef.current?.click()
            }
          >
            {showImage ? (
              <img
                src={avatarSrc!}
                alt={profile.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-semibold">
                {initials}
              </div>
            )}
            {uploadAvatarLoading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-wait">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <span className="text-[10px] font-medium text-white mt-1 drop-shadow">
                  Đang tải...
                </span>
              </div>
            )}
            {onUploadAvatar && !uploadAvatarLoading && (
              <>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <div className="rounded-full bg-white/90 p-2">
                    <Camera className="h-5 w-5 text-foreground" />
                  </div>
                  <span className="absolute bottom-1 left-0 right-0 text-[10px] font-medium text-white text-center drop-shadow">
                    Đổi ảnh
                  </span>
                </div>
              </>
            )}
          </div>
          {editing ? (
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-3 text-lg font-semibold text-foreground bg-muted/50 border border-border rounded-lg px-2 py-1 w-full max-w-[200px] text-center"
              placeholder="Họ tên"
            />
          ) : (
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              {profile.name}
            </h2>
          )}
          <p className="text-xs text-muted-foreground">Mã HS: {profile.id}</p>
        </div>

        <div className="border-t border-border/60 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Thông tin cá nhân
            </h3>
            <div className="flex items-center gap-2">
              {onSave &&
                (editing ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={14} />
                  </button>
                ))}
              <StatusBadge isComplete={isComplete} />
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail size={14} />
              </div>
              {editing ? (
                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="flex-1 min-w-0 bg-background border border-border rounded px-2 py-1 text-foreground"
                  placeholder="Email"
                />
              ) : (
                <span className="truncate text-foreground">
                  {profile.email}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone size={14} />
              </div>
              {editing ? (
                <input
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className="flex-1 min-w-0 bg-background border border-border rounded px-2 py-1 text-foreground"
                  placeholder="Số điện thoại"
                />
              ) : (
                <span className="text-foreground">{profile.phone}</span>
              )}
            </div>
            <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Calendar size={14} />
              </div>
              {editing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 min-w-0 justify-start text-left font-normal h-8 px-2",
                        !form.dob || form.dob === "Chưa cập nhật"
                          ? "text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4 shrink-0" />
                      {form.dob && form.dob !== "Chưa cập nhật"
                        ? form.dob
                        : "Chọn ngày sinh"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={dobDate}
                      onSelect={(date) => {
                        if (date) {
                          setForm((f) => ({
                            ...f,
                            dob: format(date, "dd/MM/yyyy", { locale: vi }),
                          }));
                        }
                      }}
                      locale={vi}
                      defaultMonth={dobDate}
                      captionLayout="dropdown"
                      fromYear={1980}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <span className="text-foreground">{profile.dob}</span>
              )}
            </div>
            <div className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <MapPin size={14} />
              </div>
              {editing ? (
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="flex-1 min-w-0 bg-background border border-border rounded px-2 py-1 text-foreground"
                  placeholder="Địa chỉ"
                />
              ) : (
                <span className="text-foreground">{profile.address}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
