import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  ShieldCheck,
  Sparkles,
  Download,
  Upload,
  Search,
  BarChart3,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type Category = { id: string; slug: string; name_en: string; icon: string | null; display_order: number; is_enabled: boolean };
type Question = {
  id: string;
  category_id: string | null;
  question_en: string;
  question_ta: string | null;
  question_te: string | null;
  question_kn: string | null;
  answer_en: string;
  answer_ta: string | null;
  answer_te: string | null;
  answer_kn: string | null;
  is_featured: boolean;
  is_enabled: boolean;
  is_human_verified: boolean;
  display_order: number;
  view_count: number;
  search_count: number;
  updated_at: string;
};

const emptyQ = (): Partial<Question> => ({
  question_en: "",
  answer_en: "",
  is_featured: false,
  is_enabled: true,
  is_human_verified: false,
  display_order: 0,
});

export default function GuideManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Question> | null>(null);
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [analytics, setAnalytics] = useState<{ query: string; source: string; created_at: string }[]>([]);

  const load = async () => {
    setLoading(true);
    const [{ data: cats }, { data: qs }] = await Promise.all([
      supabase.from("guide_categories").select("*").order("display_order"),
      supabase.from("guide_questions").select("*").order("display_order"),
    ]);
    setCategories((cats as Category[]) ?? []);
    setQuestions((qs as Question[]) ?? []);
    setLoading(false);
  };

  const loadAnalytics = async () => {
    const { data } = await supabase
      .from("guide_ai_queries")
      .select("query, source, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    setAnalytics(data ?? []);
  };

  useEffect(() => {
    load();
    loadAnalytics();
  }, []);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (filterCat !== "all" && q.category_id !== filterCat) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!q.question_en.toLowerCase().includes(s) && !q.answer_en.toLowerCase().includes(s))
          return false;
      }
      return true;
    });
  }, [questions, filterCat, search]);

  const saveQuestion = async () => {
    if (!editing || !editing.question_en?.trim()) {
      toast.error("Question text is required");
      return;
    }
    const payload = {
      category_id: editing.category_id ?? null,
      question_en: editing.question_en,
      question_ta: editing.question_ta ?? null,
      question_te: editing.question_te ?? null,
      question_kn: editing.question_kn ?? null,
      answer_en: editing.answer_en ?? "",
      answer_ta: editing.answer_ta ?? null,
      answer_te: editing.answer_te ?? null,
      answer_kn: editing.answer_kn ?? null,
      is_featured: !!editing.is_featured,
      is_enabled: editing.is_enabled ?? true,
      is_human_verified: !!editing.is_human_verified,
      display_order: editing.display_order ?? 0,
    };
    const { error } = editing.id
      ? await supabase.from("guide_questions").update(payload).eq("id", editing.id)
      : await supabase.from("guide_questions").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    const { error } = await supabase.from("guide_questions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const move = async (q: Question, dir: -1 | 1) => {
    const { error } = await supabase
      .from("guide_questions")
      .update({ display_order: q.display_order + dir })
      .eq("id", q.id);
    if (error) return toast.error(error.message);
    load();
  };

  const toggle = async (q: Question, field: "is_enabled" | "is_featured" | "is_human_verified") => {
    const { error } = await supabase
      .from("guide_questions")
      .update({ [field]: !q[field] } as any)
      .eq("id", q.id);
    if (error) return toast.error(error.message);
    load();
  };

  const aiSuggest = async () => {
    if (!editing?.question_en?.trim()) {
      toast.error("Enter a question first");
      return;
    }
    setAiSuggesting(true);
    try {
      const cat = categories.find((c) => c.id === editing.category_id)?.name_en;
      const { data, error } = await supabase.functions.invoke("guide-ai-suggest", {
        body: { question: editing.question_en, category: cat },
      });
      if (error) throw error;
      if (data?.suggestion) {
        setEditing({ ...editing, answer_en: data.suggestion });
        toast.success("AI suggestion applied — review and edit");
      } else {
        toast.error(data?.error ?? "No suggestion");
      }
    } catch (err: any) {
      toast.error("AI suggest failed");
    } finally {
      setAiSuggesting(false);
    }
  };

  const saveCategory = async () => {
    if (!editingCat?.name_en?.trim() || !editingCat?.slug?.trim()) {
      toast.error("Slug and name required");
      return;
    }
    const payload = {
      slug: editingCat.slug,
      name_en: editingCat.name_en,
      icon: editingCat.icon ?? null,
      display_order: editingCat.display_order ?? 0,
      is_enabled: editingCat.is_enabled ?? true,
    };
    const { error } = editingCat.id
      ? await supabase.from("guide_categories").update(payload).eq("id", editingCat.id)
      : await supabase.from("guide_categories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditingCat(null);
    load();
  };

  const exportCSV = () => {
    const rows = [
      ["category_slug", "question_en", "answer_en", "is_featured", "is_enabled", "is_human_verified", "display_order"],
      ...questions.map((q) => [
        categories.find((c) => c.id === q.category_id)?.slug ?? "",
        JSON.stringify(q.question_en),
        JSON.stringify(q.answer_en),
        q.is_featured,
        q.is_enabled,
        q.is_human_verified,
        q.display_order,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guide-questions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    const [header, ...rows] = lines;
    if (!header.includes("question_en")) return toast.error("Invalid CSV format");
    let ok = 0;
    for (const row of rows) {
      // naive CSV split respecting quoted strings
      const parts: string[] = [];
      let cur = "";
      let inQ = false;
      for (const ch of row) {
        if (ch === '"' && !inQ) { inQ = true; continue; }
        if (ch === '"' && inQ) { inQ = false; continue; }
        if (ch === "," && !inQ) { parts.push(cur); cur = ""; continue; }
        cur += ch;
      }
      parts.push(cur);
      const [slug, qen, aen, feat, en, ver, ord] = parts;
      const cat = categories.find((c) => c.slug === slug);
      if (!qen) continue;
      const { error } = await supabase.from("guide_questions").insert({
        category_id: cat?.id ?? null,
        question_en: qen,
        answer_en: aen ?? "",
        is_featured: feat === "true",
        is_enabled: en !== "false",
        is_human_verified: ver === "true",
        display_order: Number(ord) || 0,
      });
      if (!error) ok++;
    }
    toast.success(`Imported ${ok} questions`);
    load();
  };

  const topSearched = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of analytics) {
      counts.set(a.query, (counts.get(a.query) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [analytics]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.icon} {c.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setEditing(emptyQ())}><Plus className="h-4 w-4 mr-1" />Add Question</Button>
            <Button variant="outline" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />Export</Button>
            <label className="cursor-pointer">
              <Button variant="outline" asChild>
                <span><Upload className="h-4 w-4 mr-1" />Import CSV</span>
              </Button>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && importCSV(e.target.files[0])}
              />
            </label>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="space-y-2">
              {filtered.map((q) => (
                <Card key={q.id}>
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => move(q, -1)}><ArrowUp className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => move(q, 1)}><ArrowDown className="h-3 w-3" /></Button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-medium text-sm">{q.question_en}</div>
                        {q.is_featured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                        {q.is_human_verified && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                        {!q.is_enabled && <Badge variant="secondary" className="text-xs">Disabled</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{q.answer_en}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        Updated {new Date(q.updated_at).toLocaleDateString()} · Views {q.view_count} · Order {q.display_order}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <div className="flex items-center gap-2 text-xs">
                        <Switch checked={q.is_enabled} onCheckedChange={() => toggle(q, "is_enabled")} />
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggle(q, "is_featured")} title="Featured">
                          <Star className={`h-3.5 w-3.5 ${q.is_featured ? "fill-amber-400 text-amber-400" : ""}`} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggle(q, "is_human_verified")} title="Verified">
                          <ShieldCheck className={`h-3.5 w-3.5 ${q.is_human_verified ? "text-primary" : ""}`} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(q)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteQuestion(q.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No questions found</div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-3">
          <Button onClick={() => setEditingCat({ display_order: categories.length, is_enabled: true })}>
            <Plus className="h-4 w-4 mr-1" />Add Category
          </Button>
          <div className="grid gap-2">
            {categories.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <span className="text-xl">{c.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{c.name_en}</div>
                    <div className="text-xs text-muted-foreground">/{c.slug} · order {c.display_order}</div>
                  </div>
                  <Switch checked={c.is_enabled} onCheckedChange={async () => {
                    await supabase.from("guide_categories").update({ is_enabled: !c.is_enabled }).eq("id", c.id);
                    load();
                  }} />
                  <Button size="icon" variant="ghost" onClick={() => setEditingCat(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" /> Top User Queries (last 100)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topSearched.length === 0 ? (
                <div className="text-sm text-muted-foreground">No queries yet</div>
              ) : (
                <div className="space-y-1.5">
                  {topSearched.map(([q, n]) => (
                    <div key={q} className="flex items-center justify-between text-sm py-1 border-b">
                      <span className="truncate">{q}</span>
                      <Badge variant="secondary">{n}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question editor */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "New"} Question</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Category</Label>
                <Select value={editing.category_id ?? ""} onValueChange={(v) => setEditing({ ...editing, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="en">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ta">தமிழ்</TabsTrigger>
                  <TabsTrigger value="te">తెలుగు</TabsTrigger>
                  <TabsTrigger value="kn">ಕನ್ನಡ</TabsTrigger>
                </TabsList>
                {(["en", "ta", "te", "kn"] as const).map((l) => (
                  <TabsContent key={l} value={l} className="space-y-2">
                    <Label>Question ({l.toUpperCase()}){l === "en" && " *"}</Label>
                    <Input
                      value={(editing as any)[`question_${l}`] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [`question_${l}`]: e.target.value } as any)}
                    />
                    <div className="flex items-center justify-between">
                      <Label>Answer ({l.toUpperCase()})</Label>
                      {l === "en" && (
                        <Button size="sm" variant="outline" onClick={aiSuggest} disabled={aiSuggesting}>
                          {aiSuggesting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                          AI Suggest
                        </Button>
                      )}
                    </div>
                    <Textarea
                      rows={5}
                      value={(editing as any)[`answer_${l}`] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [`answer_${l}`]: e.target.value } as any)}
                    />
                  </TabsContent>
                ))}
              </Tabs>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Switch checked={!!editing.is_featured} onCheckedChange={(v) => setEditing({ ...editing, is_featured: v })} />
                  <Label>Featured (Top 10)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editing.is_enabled ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_enabled: v })} />
                  <Label>Enabled</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={!!editing.is_human_verified} onCheckedChange={(v) => setEditing({ ...editing, is_human_verified: v })} />
                  <Label>Human Verified</Label>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={editing.display_order ?? 0} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveQuestion}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category editor */}
      <Dialog open={!!editingCat} onOpenChange={(o) => !o && setEditingCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat?.id ? "Edit" : "New"} Category</DialogTitle>
          </DialogHeader>
          {editingCat && (
            <div className="space-y-3">
              <div>
                <Label>Slug *</Label>
                <Input value={editingCat.slug ?? ""} onChange={(e) => setEditingCat({ ...editingCat, slug: e.target.value })} />
              </div>
              <div>
                <Label>Name (EN) *</Label>
                <Input value={editingCat.name_en ?? ""} onChange={(e) => setEditingCat({ ...editingCat, name_en: e.target.value })} />
              </div>
              <div>
                <Label>Icon (emoji)</Label>
                <Input value={editingCat.icon ?? ""} onChange={(e) => setEditingCat({ ...editingCat, icon: e.target.value })} />
              </div>
              <div>
                <Label>Order</Label>
                <Input type="number" value={editingCat.display_order ?? 0} onChange={(e) => setEditingCat({ ...editingCat, display_order: Number(e.target.value) })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCat(null)}>Cancel</Button>
            <Button onClick={saveCategory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
