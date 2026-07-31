import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sparkles, Search, ShieldCheck, Loader2, MessageCircleQuestion } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";

type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_ta: string | null;
  name_te: string | null;
  name_kn: string | null;
  icon: string | null;
};

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
  is_human_verified: boolean;
  display_order: number;
};

export default function AIGuide() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState<{
    text: string;
    source: "faq" | "ai" | "fallback";
    verified?: boolean;
  } | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: qs }] = await Promise.all([
        supabase.from("guide_categories").select("*").eq("is_enabled", true).order("display_order"),
        supabase.from("guide_questions").select("*").eq("is_enabled", true).order("display_order"),
      ]);
      setCategories(cats ?? []);
      setQuestions(qs ?? []);
    })();
  }, []);

  const lang = (["en", "ta", "te", "kn"].includes(language) ? language : "en") as
    | "en"
    | "ta"
    | "te"
    | "kn";

  const localize = (q: Question, field: "question" | "answer") => {
    const key = `${field}_${lang}` as keyof Question;
    return (q[key] as string) || (q[`${field}_en` as keyof Question] as string);
  };

  const localizeCat = (c: Category) => {
    const key = `name_${lang}` as keyof Category;
    return (c[key] as string) || c.name_en;
  };

  const featured = useMemo(
    () => questions.filter((q) => q.is_featured).slice(0, 10),
    [questions],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return questions;
    const s = search.toLowerCase();
    return questions.filter(
      (q) =>
        localize(q, "question").toLowerCase().includes(s) ||
        localize(q, "answer").toLowerCase().includes(s),
    );
  }, [questions, search, lang]);

  const grouped = useMemo(() => {
    const map = new Map<string, Question[]>();
    for (const q of filtered) {
      if (!q.category_id) continue;
      if (!map.has(q.category_id)) map.set(q.category_id, []);
      map.get(q.category_id)!.push(q);
    }
    return map;
  }, [filtered]);

  const askAi = async (query?: string) => {
    const q = (query ?? aiQuery).trim();
    if (!q) return;
    setAsking(true);
    setAiAnswer(null);
    try {
      const { data, error } = await supabase.functions.invoke("guide-ai-answer", {
        body: { query: q, language: lang },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setAiAnswer({ text: data.answer, source: data.source, verified: data.verified });
    } catch (err: any) {
      toast.error("Could not get an answer right now.");
      logger.error(err);
    } finally {
      setAsking(false);
    }
  };

  const exampleQuestions = [
    "Which Lingam is nearest?",
    "Temple timings today?",
    "Where is Annadhanam?",
    "Best time to start Girivalam?",
    "Can I wear jeans?",
    "How many kilometers left?",
  ];

  return (
    <>
      <Helmet>
        <title>AI Girivalam Guide — Ask Anything About Arunachala | MyGirivalam</title>
        <meta
          name="description"
          content="Ask anything about Arunachala Girivalam. Get instant answers powered by AI and verified by our admin team — timings, route, Ashta Lingams, Annadhanam, safety and more."
        />
        <link rel="canonical" href="https://mygirivalam.in/ai-guide" />
      </Helmet>

      <div className="min-h-screen bg-background pt-20 md:pt-24">
        <SiteHeader />

        {/* Hero */}
        <section className="px-4 py-10 md:py-14 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-3">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI-powered · Admin verified
            </Badge>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-3">
              AI Girivalam Guide
            </h1>
            <p className="text-muted-foreground mb-6">
              Ask anything about Arunachala Girivalam. Get instant answers powered by AI and
              verified by the admin.
            </p>

            {/* AI Ask box */}
            <SpiritualCard className="p-4 md:p-5 text-left">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  askAi();
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <MessageCircleQuestion className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask AI anything..."
                    className="pl-9"
                  />
                </div>
                <Button type="submit" disabled={asking} className="sacred-button">
                  {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask"}
                </Button>
              </form>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {exampleQuestions.map((eg) => (
                  <button
                    key={eg}
                    onClick={() => {
                      setAiQuery(eg);
                      askAi(eg);
                    }}
                    className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/70 transition-colors"
                  >
                    {eg}
                  </button>
                ))}
              </div>

              {aiAnswer && (
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/15">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={aiAnswer.source === "faq" ? "default" : "secondary"}>
                      {aiAnswer.source === "faq" ? "Verified answer" : "AI answer"}
                    </Badge>
                    {aiAnswer.verified && (
                      <Badge variant="outline" className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Admin verified
                      </Badge>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{aiAnswer.text}</ReactMarkdown>
                  </div>
                </div>
              )}
            </SpiritualCard>
          </div>
        </section>

        {/* Top Quick Questions */}
        {featured.length > 0 && (
          <section className="px-4 pb-8">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-playfair text-xl md:text-2xl font-semibold mb-4">
                Top Quick Questions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {featured.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setAiQuery(localize(q, "question"));
                      askAi(localize(q, "question"));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-left p-3 rounded-lg border bg-card hover:border-primary/40 hover:shadow-sm transition-all text-sm"
                  >
                    <div className="font-medium leading-snug line-clamp-2">
                      {localize(q, "question")}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Search + Categorized FAQs */}
        <section className="px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-playfair text-xl md:text-2xl font-semibold">
                AI Frequently Asked Questions
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-5">
              {categories.map((cat) => {
                const items = grouped.get(cat.id);
                if (!items || items.length === 0) return null;
                return (
                  <SpiritualCard key={cat.id} className="p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{cat.icon}</span>
                      <h3 className="font-semibold text-base">{localizeCat(cat)}</h3>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {items.length}
                      </Badge>
                    </div>
                    <Accordion type="single" collapsible>
                      {items.map((q) => (
                        <AccordionItem key={q.id} value={q.id}>
                          <AccordionTrigger className="text-left text-sm hover:no-underline">
                            <span className="flex items-start gap-2">
                              {q.is_human_verified && (
                                <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              )}
                              {localize(q, "question")}
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown>{localize(q, "answer")}</ReactMarkdown>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </SpiritualCard>
                );
              })}

              {filtered.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  No questions match your search. Try asking the AI above.
                </div>
              )}
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
