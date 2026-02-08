'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import RoleGuard from '@/components/auth/RoleGuard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type FacultyRow = { id: string; name: string; description: string | null; type: string | null; url_web: string | null };
type ScholarshipRow = { id: string; name: string; description: string | null; deadline: string | null; url_web: string | null };

type UniversityRow = {
  id: number;
  name: string;
  country: string | null;
  state: string | null;
  current_ranking: number | null;
  website_url: string | null;
  logo_url: string | null;
  essay_requirements: string | null;
  _count: { faculty: number; scholarship: number };
};

type UniversityDetail = UniversityRow & {
  faculty: FacultyRow[];
  scholarship: ScholarshipRow[];
};

const emptyUniversity = (): Partial<UniversityDetail> => ({
  name: '',
  country: '',
  state: '',
  current_ranking: null,
  website_url: '',
  logo_url: '',
  essay_requirements: '',
});

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<UniversityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<UniversityDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyUniversity());
  const [addFacultyOpen, setAddFacultyOpen] = useState(false);
  const [addScholarshipOpen, setAddScholarshipOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyRow | null>(null);
  const [editingScholarship, setEditingScholarship] = useState<ScholarshipRow | null>(null);
  const [facultyForm, setFacultyForm] = useState({ name: '', description: '', type: '', url_web: '' });
  const [scholarshipForm, setScholarshipForm] = useState({ name: '', description: '', deadline: '', url_web: '' });

  const loadList = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/universities');
      if (res.ok) {
        const data = await res.json();
        setUniversities(data.universities || []);
      }
    } catch (e) {
      toast.error('Failed to load universities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/universities/${id}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data.university);
        setForm({
          name: data.university.name,
          country: data.university.country ?? '',
          state: data.university.state ?? '',
          current_ranking: data.university.current_ranking,
          website_url: data.university.website_url ?? '',
          logo_url: data.university.logo_url ?? '',
          essay_requirements: data.university.essay_requirements ?? '',
        });
      } else {
        toast.error('University not found');
      }
    } catch (e) {
      toast.error('Failed to load university');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openCreate = () => {
    setForm(emptyUniversity());
    setCreateOpen(true);
  };

  const openEdit = (u: UniversityRow) => {
    setDetailOpen(true);
    loadDetail(u.id);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          country: form.country || null,
          state: form.state || null,
          current_ranking: form.current_ranking ?? null,
          website_url: form.website_url || null,
          logo_url: form.logo_url || null,
          essay_requirements: form.essay_requirements || null,
        }),
      });
      if (res.ok) {
        toast.success('University created');
        setCreateOpen(false);
        loadList();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Create failed');
      }
    } catch (e) {
      toast.error('Create failed');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !form.name?.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/universities/${detail.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          country: form.country || null,
          state: form.state || null,
          current_ranking: form.current_ranking ?? null,
          website_url: form.website_url || null,
          logo_url: form.logo_url || null,
          essay_requirements: form.essay_requirements || null,
        }),
      });
      if (res.ok) {
        toast.success('Updated');
        setDetail((d) => (d ? { ...d, ...form } : null));
        loadList();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Update failed');
      }
    } catch (e) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/universities/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted');
        setDeleteId(null);
        setDetailOpen(false);
        setDetail(null);
        loadList();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Delete failed');
      }
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !facultyForm.name.trim()) return;
    try {
      const res = await fetch(`/api/admin/universities/${detail.id}/faculty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: facultyForm.name.trim(),
          description: facultyForm.description || null,
          type: facultyForm.type || null,
          url_web: facultyForm.url_web || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDetail((d) => (d ? { ...d, faculty: [...d.faculty, data.faculty] } : null));
        setFacultyForm({ name: '', description: '', type: '', url_web: '' });
        setAddFacultyOpen(false);
        toast.success('Faculty added');
        loadList();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed');
      }
    } catch (e) {
      toast.error('Failed');
    }
  };

  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty || !editingFaculty.id) return;
    try {
      const res = await fetch(`/api/admin/faculty/${editingFaculty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: facultyForm.name.trim(),
          description: facultyForm.description || null,
          type: facultyForm.type || null,
          url_web: facultyForm.url_web || null,
        }),
      });
      if (res.ok) {
        setDetail((d) =>
          d
            ? {
                ...d,
                faculty: d.faculty.map((f) =>
                  f.id === editingFaculty.id
                    ? { ...f, name: facultyForm.name, description: facultyForm.description || null, type: facultyForm.type || null, url_web: facultyForm.url_web || null }
                    : f
                ),
              }
            : null
        );
        setEditingFaculty(null);
        setFacultyForm({ name: '', description: '', type: '', url_web: '' });
        toast.success('Faculty updated');
        loadList();
      } else {
        toast.error('Update failed');
      }
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/faculty/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDetail((d) => (d ? { ...d, faculty: d.faculty.filter((f) => f.id !== id) } : null));
        toast.success('Faculty deleted');
        loadList();
      } else {
        toast.error('Delete failed');
      }
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const handleAddScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !scholarshipForm.name.trim()) return;
    try {
      const res = await fetch(`/api/admin/universities/${detail.id}/scholarships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scholarshipForm.name.trim(),
          description: scholarshipForm.description || null,
          deadline: scholarshipForm.deadline || null,
          url_web: scholarshipForm.url_web || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const s = data.scholarship;
        const deadlineStr = s.deadline ? (typeof s.deadline === 'string' ? s.deadline : new Date(s.deadline).toISOString().slice(0, 10)) : null;
        setDetail((d) => (d ? { ...d, scholarship: [...d.scholarship, { id: s.id, name: s.name, description: s.description ?? null, deadline: deadlineStr, url_web: s.url_web ?? null }] } : null));
        setScholarshipForm({ name: '', description: '', deadline: '', url_web: '' });
        setAddScholarshipOpen(false);
        toast.success('Scholarship added');
        loadList();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed');
      }
    } catch (e) {
      toast.error('Failed');
    }
  };

  const handleUpdateScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScholarship || !editingScholarship.id) return;
    try {
      const res = await fetch(`/api/admin/scholarships/${editingScholarship.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scholarshipForm.name.trim(),
          description: scholarshipForm.description || null,
          deadline: scholarshipForm.deadline || null,
          url_web: scholarshipForm.url_web || null,
        }),
      });
      if (res.ok) {
        setDetail((d) =>
          d
            ? {
                ...d,
                scholarship: d.scholarship.map((s) =>
                  s.id === editingScholarship.id
                    ? { ...s, name: scholarshipForm.name, description: scholarshipForm.description || null, deadline: scholarshipForm.deadline || null, url_web: scholarshipForm.url_web || null }
                    : s
                ),
              }
            : null
        );
        setEditingScholarship(null);
        setScholarshipForm({ name: '', description: '', deadline: '', url_web: '' });
        toast.success('Scholarship updated');
        loadList();
      } else {
        toast.error('Update failed');
      }
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const handleDeleteScholarship = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/scholarships/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDetail((d) => (d ? { ...d, scholarship: d.scholarship.filter((s) => s.id !== id) } : null));
        toast.success('Scholarship deleted');
        loadList();
      } else {
        toast.error('Delete failed');
      }
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const openEditFaculty = (f: FacultyRow) => {
    setEditingFaculty(f);
    setFacultyForm({ name: f.name, description: f.description ?? '', type: f.type ?? '', url_web: f.url_web ?? '' });
  };

  const openEditScholarship = (s: ScholarshipRow) => {
    setEditingScholarship(s);
    setScholarshipForm({
      name: s.name,
      description: s.description ?? '',
      deadline: s.deadline ? s.deadline.toString().slice(0, 10) : '',
      url_web: s.url_web ?? '',
    });
  };

  const filtered = universities.filter(
    (u) =>
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.country && u.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.state && u.state.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const inputClass = 'w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary';

  return (
    <RoleGuard allowedRoles={['admin', 'ADMIN']}>
      <div className="w-full min-h-[300px] flex flex-col">
        <div className="flex-1 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl font-semibold text-foreground">Universities</h1>
            <div className="flex items-center gap-2">
              <div className="relative max-w-xs">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-1" />
                Add university
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="border border-border rounded-xl bg-muted/20 border-dashed py-16 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground">No universities</h3>
              <p className="text-sm text-muted-foreground">Add one to get started.</p>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground hidden md:table-cell">Country</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground hidden lg:table-cell">State</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Ranking</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Faculty</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Scholarships</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{u.name}</div>
                          {u.website_url && (
                            <a href={u.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-0.5 mt-0.5">
                              <ExternalLink className="h-3 w-3" /> Link
                            </a>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{u.country ?? '–'}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">{u.state ?? '–'}</td>
                        <td className="py-3 px-4 text-sm">{u.current_ranking ?? '–'}</td>
                        <td className="py-3 px-4 text-sm">{u._count.faculty}</td>
                        <td className="py-3 px-4 text-sm">{u._count.scholarship}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(u)} className="text-primary">
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteId(u.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create modal */}
          <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add university</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="University name" required className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <Input value={form.country ?? ''} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <Input value={form.state ?? ''} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ranking</label>
                  <Input type="number" value={form.current_ranking ?? ''} onChange={(e) => setForm({ ...form, current_ranking: e.target.value ? Number(e.target.value) : null })} placeholder="e.g. 1" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Website URL</label>
                  <Input value={form.website_url ?? ''} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Logo URL</label>
                  <Input value={form.logo_url ?? ''} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Essay requirements</label>
                  <Textarea value={form.essay_requirements ?? ''} onChange={(e) => setForm({ ...form, essay_requirements: e.target.value })} placeholder="Text..." rows={3} className={inputClass} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={saving} className="flex-1">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit / Detail modal */}
          <Dialog open={detailOpen} onOpenChange={(o) => !o && (setDetailOpen(false), setDetail(null), setEditingFaculty(null), setEditingScholarship(null))}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{detail ? detail.name : 'University'}</DialogTitle>
              </DialogHeader>
              {detailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : detail ? (
                <div className="space-y-6">
                  <form onSubmit={handleUpdateUniversity} className="space-y-3 border-b border-border pb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name *</label>
                      <Input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <Input value={form.country ?? ''} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <Input value={form.state ?? ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ranking</label>
                      <Input type="number" value={form.current_ranking ?? ''} onChange={(e) => setForm({ ...form, current_ranking: e.target.value ? Number(e.target.value) : null })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Website URL</label>
                      <Input value={form.website_url ?? ''} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Logo URL</label>
                      <Input value={form.logo_url ?? ''} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Essay requirements</label>
                      <Textarea value={form.essay_requirements ?? ''} onChange={(e) => setForm({ ...form, essay_requirements: e.target.value })} rows={3} className={inputClass} />
                    </div>
                    <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save university'}</Button>
                  </form>

                  {/* Faculties */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-foreground">Faculty ({detail.faculty.length})</h3>
                      <Button type="button" size="sm" variant="outline" onClick={() => setAddFacultyOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                    {detail.faculty.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No faculty yet.</p>
                    ) : (
                      <ul className="border border-border rounded-lg divide-y divide-border max-h-40 overflow-y-auto">
                        {detail.faculty.map((f) => (
                          <li key={f.id} className="flex items-center justify-between px-3 py-2">
                            <div>
                              <span className="font-medium text-sm">{f.name}</span>
                              {f.type && <span className="text-muted-foreground text-xs ml-2">({f.type})</span>}
                            </div>
                            <div className="flex gap-1">
                              <Button type="button" variant="ghost" size="sm" onClick={() => openEditFaculty(f)}>Edit</Button>
                              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteFaculty(f.id)}>Delete</Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Scholarships */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-foreground">Scholarships ({detail.scholarship.length})</h3>
                      <Button type="button" size="sm" variant="outline" onClick={() => setAddScholarshipOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                    {detail.scholarship.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No scholarships yet.</p>
                    ) : (
                      <ul className="border border-border rounded-lg divide-y divide-border max-h-40 overflow-y-auto">
                        {detail.scholarship.map((s) => (
                          <li key={s.id} className="flex items-center justify-between px-3 py-2">
                            <div>
                              <span className="font-medium text-sm">{s.name}</span>
                              {s.deadline && <span className="text-muted-foreground text-xs ml-2">Deadline: {new Date(s.deadline).toLocaleDateString()}</span>}
                            </div>
                            <div className="flex gap-1">
                              <Button type="button" variant="ghost" size="sm" onClick={() => openEditScholarship(s)}>Edit</Button>
                              <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteScholarship(s.id)}>Delete</Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="destructive" size="sm" onClick={() => detail && setDeleteId(detail.id)}>Delete university</Button>
                  </div>
                </div>
              ) : null}
            </DialogContent>
          </Dialog>

          {/* Add / Edit Faculty dialog */}
          <Dialog open={addFacultyOpen || !!editingFaculty} onOpenChange={(o) => !o && (setAddFacultyOpen(false), setEditingFaculty(null), setFacultyForm({ name: '', description: '', type: '', url_web: '' }))}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingFaculty ? 'Edit faculty' : 'Add faculty'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={editingFaculty ? handleUpdateFaculty : handleAddFaculty} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input value={facultyForm.name} onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea value={facultyForm.description} onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })} rows={2} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Input value={facultyForm.type} onChange={(e) => setFacultyForm({ ...facultyForm, type: e.target.value })} placeholder="e.g. Engineering" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <Input value={facultyForm.url_web} onChange={(e) => setFacultyForm({ ...facultyForm, url_web: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => (setAddFacultyOpen(false), setEditingFaculty(null))} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1">{editingFaculty ? 'Update' : 'Add'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add / Edit Scholarship dialog */}
          <Dialog open={addScholarshipOpen || !!editingScholarship} onOpenChange={(o) => !o && (setAddScholarshipOpen(false), setEditingScholarship(null), setScholarshipForm({ name: '', description: '', deadline: '', url_web: '' }))}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingScholarship ? 'Edit scholarship' : 'Add scholarship'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={editingScholarship ? handleUpdateScholarship : handleAddScholarship} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input value={scholarshipForm.name} onChange={(e) => setScholarshipForm({ ...scholarshipForm, name: e.target.value })} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea value={scholarshipForm.description} onChange={(e) => setScholarshipForm({ ...scholarshipForm, description: e.target.value })} rows={2} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <Input type="date" value={scholarshipForm.deadline} onChange={(e) => setScholarshipForm({ ...scholarshipForm, deadline: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <Input value={scholarshipForm.url_web} onChange={(e) => setScholarshipForm({ ...scholarshipForm, url_web: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => (setAddScholarshipOpen(false), setEditingScholarship(null))} className="flex-1">Cancel</Button>
                  <Button type="submit" className="flex-1">{editingScholarship ? 'Update' : 'Add'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete confirm */}
          <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete university?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">This will also delete all related faculty and scholarships. This action cannot be undone.</p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Cancel</Button>
                <Button variant="destructive" onClick={() => deleteId != null && handleDelete(deleteId)} className="flex-1">Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </RoleGuard>
  );
}
