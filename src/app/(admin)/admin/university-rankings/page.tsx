'use client';

import React, { useState, useEffect, useMemo } from 'react';
import RoleGuard from '@/components/auth/RoleGuard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, Download, RefreshCw, Plus, Trash2 } from 'lucide-react';

type Row = {
  id: number;
  qs_rank: number;
  name: string;
  country: string;
  country_code: string;
  qs_overall_score: number;
};

const CSV_HEADER =
  'qs_rank,name,country,country_code,city,region,type,founded_year,total_students,website,qs_overall_score,academic_reputation,employer_reputation,faculty_student_ratio,citations_per_faculty,international_faculty,international_students,strong_subjects,description';

export default function AdminUniversityRankingsPage() {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    created: number;
    updated: number;
    errors?: string[];
  } | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [addForm, setAddForm] = useState({
    qs_rank: '',
    name: '',
    country: '',
    country_code: '',
    city: '',
    region: '',
    type: '',
    founded_year: '',
    total_students: '',
    website: '',
    qs_overall_score: '0',
    academic_reputation: '0',
    employer_reputation: '0',
    faculty_student_ratio: '0',
    citations_per_faculty: '0',
    international_faculty: '0',
    international_students: '0',
    strong_subjects: '',
    description: '',
  });
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<Row | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/university-rankings')
      .then((r) => r.json())
      .then((data) => setList(data.universities ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredList = useMemo(
    () =>
      list.filter((u) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          u.name.toLowerCase().includes(q) ||
          u.country.toLowerCase().includes(q) ||
          String(u.qs_rank).includes(q)
        );
      }),
    [list, search],
  );

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setBulkResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/university-rankings/bulk', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setBulkResult({
          created: data.created ?? 0,
          updated: data.updated ?? 0,
          errors: data.errors,
        });
        setFile(null);
        load();
      } else {
        setBulkResult({
          created: 0,
          updated: 0,
          errors: [data.error || data.detail || 'Upload thất bại'],
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    try {
      const payload = {
        qs_rank: Number(addForm.qs_rank),
        name: addForm.name.trim(),
        country: addForm.country.trim(),
        country_code: addForm.country_code.trim(),
        city: addForm.city.trim() || null,
        region: addForm.region.trim() || null,
        type: addForm.type.trim() || null,
        founded_year: addForm.founded_year ? Number(addForm.founded_year) : null,
        total_students: addForm.total_students ? Number(addForm.total_students) : null,
        website: addForm.website.trim() || null,
        qs_overall_score: Number(addForm.qs_overall_score) || 0,
        academic_reputation: Number(addForm.academic_reputation) || 0,
        employer_reputation: Number(addForm.employer_reputation) || 0,
        faculty_student_ratio: Number(addForm.faculty_student_ratio) || 0,
        citations_per_faculty: Number(addForm.citations_per_faculty) || 0,
        international_faculty: Number(addForm.international_faculty) || 0,
        international_students: Number(addForm.international_students) || 0,
        strong_subjects: addForm.strong_subjects
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter(Boolean),
        description: addForm.description.trim() || null,
      };
      const res = await fetch('/api/admin/university-rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAddModalOpen(false);
        setAddForm({
          qs_rank: '',
          name: '',
          country: '',
          country_code: '',
          city: '',
          region: '',
          type: '',
          founded_year: '',
          total_students: '',
          website: '',
          qs_overall_score: '0',
          academic_reputation: '0',
          employer_reputation: '0',
          faculty_student_ratio: '0',
          citations_per_faculty: '0',
          international_faculty: '0',
          international_students: '0',
          strong_subjects: '',
          description: '',
        });
        load();
      } else {
        alert(data.error || 'Tạo trường thất bại');
      }
    } finally {
      setAddSaving(false);
    }
  };

  const handleDeleteClick = (u: Row) => {
    setSchoolToDelete(u);
  };

  const handleConfirmDelete = async () => {
    if (!schoolToDelete) return;
    const id = schoolToDelete.id;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/university-rankings/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSchoolToDelete(null);
        load();
      } else {
        alert(data.error || 'Không thể xóa trường');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const downloadTemplate = () => {
    const line = CSV_HEADER + '\n1,MIT,United States,US,Cambridge MA,North America,Private,1861,11574,https://web.mit.edu,100,100,100,99.7,99.9,92.4,90.8,"Engineering, Computer Science",Description optional';
    const blob = new Blob([line], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'university-rankings-template.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <RoleGuard allowedRoles={['admin', 'ADMIN']}>
      <div className="w-full max-w-6xl mx-auto min-h-[300px] p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-foreground">Xếp hạng trường (QS)</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setAddModalOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" /> Add school
            </Button>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1">
              <Download className="h-4 w-4" /> Tải mẫu CSV
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-1">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
            </Button>
          </div>
        </div>

        {/* Bulk upload */}
        <form
          onSubmit={handleBulkSubmit}
          className="mb-6 p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-end gap-3"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Bulk upsert từ CSV</label>
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              className="w-full text-sm text-foreground file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-sm"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setBulkResult(null);
              }}
            />
          </div>
          <Button type="submit" disabled={!file || uploading} className="gap-1 shrink-0">
            <Upload className="h-4 w-4" /> {uploading ? 'Đang xử lý...' : 'Tải lên'}
          </Button>
        </form>

        {bulkResult && (
          <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
            <p className="text-sm font-medium text-foreground">
              Kết quả: {bulkResult.created} tạo mới, {bulkResult.updated} cập nhật.
            </p>
            {bulkResult.errors && bulkResult.errors.length > 0 && (
              <ul className="mt-2 text-sm text-destructive list-disc list-inside">
                {bulkResult.errors.slice(0, 10).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {bulkResult.errors.length > 10 && (
                  <li>... và {bulkResult.errors.length - 10} lỗi khác</li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* Search + Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="sm:w-80">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo tên trường, quốc gia, QS rank..."
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Đang hiển thị {filteredList.length} / {list.length} trường
              </p>
            </div>
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-semibold">#</th>
                      <th className="text-left p-3 font-semibold">QS</th>
                      <th className="text-left p-3 font-semibold">Tên trường</th>
                      <th className="text-left p-3 font-semibold">Quốc gia</th>
                      <th className="text-left p-3 font-semibold">Điểm</th>
                      <th className="text-right p-3 font-semibold w-20">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((u) => (
                      <tr key={u.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-3 text-muted-foreground">{u.id}</td>
                        <td className="p-3 font-medium">{u.qs_rank}</td>
                        <td className="p-3">{u.name}</td>
                        <td className="p-3">{u.country}</td>
                        <td className="p-3">{u.qs_overall_score.toFixed(1)}</td>
                        <td className="p-3 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDeleteClick(u)}
                            disabled={deletingId === u.id}
                            title="Xóa trường"
                          >
                            {deletingId === u.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredList.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Không tìm thấy trường phù hợp với từ khóa.
                </p>
              )}
            </div>
          </>
        )}

        {/* Modal cảnh báo xóa trường */}
        <Dialog open={!!schoolToDelete} onOpenChange={(open) => !open && setSchoolToDelete(null)}>
          <DialogContent className="sm:max-w-md p-6 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 mb-2">
                <Trash2 className="h-7 w-7 text-destructive" />
              </div>
              <DialogHeader className="pb-0">
                <DialogTitle className="text-lg">Xác nhận xóa trường</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Bạn có chắc chắn muốn xóa trường{' '}
                <span className="font-semibold text-foreground">{schoolToDelete?.name}</span>?
                <br />
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3 w-full pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSchoolToDelete(null)}
                  disabled={!!deletingId}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={handleConfirmDelete}
                  disabled={!!deletingId}
                >
                  {deletingId ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-4 max-w-full rounded-lg border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium text-foreground mb-1.5">Định dạng CSV</p>
          <p className="text-xs text-muted-foreground mb-1.5 break-words">
            Header (theo thứ tự):{' '}
            <code className="break-all rounded bg-muted/50 px-1 py-0.5 text-[11px]">
              qs_rank,name,country,country_code,city,region,type,founded_year,total_students,website,qs_overall_score,academic_reputation,employer_reputation,faculty_student_ratio,citations_per_faculty,international_faculty,international_students,strong_subjects,description
            </code>
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>strong_subjects</strong>: chuỗi ngành cách nhau dấu phẩy (hoặc chấm phẩy). Cột tùy chọn: city, region, type, founded_year, total_students, website, description.
          </p>
        </div>

        {/* Add school modal */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0">
            <div className="shrink-0 px-6 pt-6 pb-2 pr-10 border-b border-border">
              <DialogHeader>
                <DialogTitle>Add school</DialogTitle>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">QS Rank *</label>
                  <input
                    type="number"
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={addForm.qs_rank}
                    onChange={(e) => setAddForm((f) => ({ ...f, qs_rank: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tên trường *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={addForm.name}
                    onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quốc gia *</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={addForm.country}
                    onChange={(e) => setAddForm((f) => ({ ...f, country: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mã quốc gia *</label>
                  <input
                    type="text"
                    required
                    placeholder="US, GB, ..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={addForm.country_code}
                    onChange={(e) => setAddForm((f) => ({ ...f, country_code: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thành phố</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={addForm.city}
                    onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Khu vực</label>
                  <input
                    type="text"
                    placeholder="Asia, Europe, ..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={addForm.region}
                    onChange={(e) => setAddForm((f) => ({ ...f, region: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Loại</label>
                  <input
                    type="text"
                    placeholder="Public, Private"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={addForm.type}
                    onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website</label>
                  <input
                    type="url"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={addForm.website}
                    onChange={(e) => setAddForm((f) => ({ ...f, website: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Năm thành lập</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={addForm.founded_year}
                    onChange={(e) => setAddForm((f) => ({ ...f, founded_year: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số sinh viên</label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={addForm.total_students}
                    onChange={(e) => setAddForm((f) => ({ ...f, total_students: e.target.value }))}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Điểm số (0–100)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  'qs_overall_score',
                  'academic_reputation',
                  'employer_reputation',
                  'faculty_student_ratio',
                  'citations_per_faculty',
                  'international_faculty',
                  'international_students',
                ].map((key) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-0.5">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      required
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                      value={addForm[key as keyof typeof addForm]}
                      onChange={(e) =>
                        setAddForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngành mạnh (cách nhau dấu phẩy)</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Engineering, Computer Science, ..."
                  value={addForm.strong_subjects}
                  onChange={(e) => setAddForm((f) => ({ ...f, strong_subjects: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={addForm.description}
                  onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={addSaving}>
                  {addSaving ? 'Đang lưu...' : 'Thêm trường'}
                </Button>
              </div>
            </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
