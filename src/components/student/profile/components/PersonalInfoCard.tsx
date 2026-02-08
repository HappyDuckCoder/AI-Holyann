"use client";

import React, { useRef, useState, useEffect } from "react";
import { Mail, Phone, Calendar, MapPin, Camera, Pencil, Check, X } from "lucide-react";
import { StudentProfile } from "../../../types";
import { StatusBadge } from "./StatusBadge";

interface PersonalInfoCardProps {
  profile: StudentProfile;
  isComplete: boolean;
  onUploadAvatar?: (file: File) => void;
  onSave?: (data: { name: string; email: string; phone: string; dob: string; address: string }) => void;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  profile,
  isComplete,
  onUploadAvatar,
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
  }, [profile.name, profile.email, profile.phone, profile.dob, profile.address]);

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

  const initials = (form.name || profile.name)
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-br from-primary/80 via-primary/60 to-primary/40" />
      <div className="px-5 pb-5 relative">
        <div className="flex flex-col items-center -mt-12 mb-4">
          <div
            className="relative group w-24 h-24 rounded-full border-4 border-card overflow-hidden shadow-lg bg-muted"
            onClick={() => onUploadAvatar && inputRef.current?.click()}
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
            {onUploadAvatar && (
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
            <h2 className="mt-3 text-lg font-semibold text-foreground">{profile.name}</h2>
          )}
          <p className="text-xs text-muted-foreground">Mã HS: {profile.id}</p>
        </div>

        <div className="border-t border-border/60 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Thông tin cá nhân
            </h3>
            <div className="flex items-center gap-2">
              {onSave && (
                editing ? (
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
                )
              )}
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
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="flex-1 min-w-0 bg-background border border-border rounded px-2 py-1 text-foreground"
                  placeholder="Email"
                />
              ) : (
                <span className="truncate text-foreground">{profile.email}</span>
              )}
            </div>
            <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Phone size={14} />
              </div>
              {editing ? (
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
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
                <input
                  value={form.dob}
                  onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                  className="flex-1 min-w-0 bg-background border border-border rounded px-2 py-1 text-foreground"
                  placeholder="Ngày sinh (vd: 01/01/2010)"
                />
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
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
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
