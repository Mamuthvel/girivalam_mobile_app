import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NO_ANSWER =
  "No verified information is available yet. Please contact the temple information center.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query, language = "en" } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Try exact/keyword match against enabled questions
    const { data: matches } = await supabase
      .from("guide_questions")
      .select("id, question_en, answer_en, answer_ta, answer_te, answer_kn, is_human_verified")
      .eq("is_enabled", true)
      .or(`question_en.ilike.%${query.replace(/[%_]/g, "")}%,answer_en.ilike.%${query.replace(/[%_]/g, "")}%`)
      .limit(5);

    if (matches && matches.length > 0) {
      const best = matches[0];
      const answerKey = `answer_${language}` as keyof typeof best;
      const answer = (best[answerKey] as string) || best.answer_en;
      await supabase.from("guide_ai_queries").insert({
        query,
        matched_question_id: best.id,
        answer,
        source: "faq",
        language,
      });
      await supabase
        .from("guide_questions")
        .update({ search_count: 1 })
        .eq("id", best.id);
      return new Response(
        JSON.stringify({
          answer,
          source: "faq",
          verified: best.is_human_verified,
          matched_question_id: best.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. AI fallback with all verified content as context
    const { data: context } = await supabase
      .from("guide_questions")
      .select("question_en, answer_en")
      .eq("is_enabled", true)
      .eq("is_human_verified", true)
      .limit(60);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ answer: NO_ANSWER, source: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const knowledge = (context ?? [])
      .map((r) => `Q: ${r.question_en}\nA: ${r.answer_en}`)
      .join("\n\n");

    const systemPrompt = `You are the AI Girivalam Guide for pilgrims visiting Arunachala (Tiruvannamalai). Answer ONLY from the verified knowledge base below. If the answer is not clearly derivable from the knowledge base, reply exactly: "${NO_ANSWER}". Keep answers concise (max 3 sentences), devotional in tone, and factual.\n\nVERIFIED KNOWLEDGE BASE:\n${knowledge}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact the admin." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ answer: NO_ANSWER, source: "fallback" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiRes.json();
    const answer: string = aiJson.choices?.[0]?.message?.content ?? NO_ANSWER;

    await supabase.from("guide_ai_queries").insert({
      query,
      answer,
      source: "ai",
      language,
    });

    return new Response(
      JSON.stringify({ answer, source: "ai", verified: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("guide-ai-answer error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// Admin AI suggest-answer helper endpoint could be added; keeping this file focused on user queries.
