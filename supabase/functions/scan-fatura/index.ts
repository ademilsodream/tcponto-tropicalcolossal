import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

// Mesmo gateway/modelo/formato de imagem já usados em produção por extract-invoice-items.
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({
  image: z.string().min(100).max(8_000_000),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

const toNullableString = z.preprocess(
  (v) => (v === null || v === undefined || v === "" ? null : String(v)),
  z.string().nullable(),
);
const toNullableNumber = z.preprocess((v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/[^\d,.\-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}, z.number().nullable());

const Fatura = z.object({
  fornecedor_nome: toNullableString,
  fornecedor_nif: toNullableString,
  numero_fatura: toNullableString,
  data_fatura: toNullableString,
  valor_total: toNullableNumber,
});

const SYSTEM_PROMPT =
  "Lês faturas portuguesas (ou de outros países). Extrai o fornecedor (emitente, não o cliente), o NIF do emitente só com dígitos, " +
  "o número da fatura tal como impresso (com prefixo/série), a data de emissão em formato AAAA-MM-DD e o valor total a pagar com IVA como número " +
  "(ponto como separador decimal, sem símbolo de moeda). Usa null apenas quando o campo não for mesmo legível. " +
  "Responde APENAS com um objeto JSON válido com as chaves: fornecedor_nome, fornecedor_nif, numero_fatura, data_fatura, valor_total.";

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Sessão em falta" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u, error: ue } = await supabase.auth.getUser();
    if (ue || !u.user) return json({ error: "Sessão inválida" }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Imagem inválida" }, 400);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "IA não configurada" }, 500);

    const imageBytes = Math.floor((parsed.data.image.length * 3) / 4);

    const aiRes = await fetch(AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.1,
        max_tokens: 1024,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Extrai os dados desta fatura e responde só com o JSON." },
              { type: "image_url", image_url: { url: `data:${parsed.data.mimeType};base64,${parsed.data.image}` } },
            ],
          },
        ],
      }),
      signal: req.signal,
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("scan-fatura gateway error", aiRes.status, t.slice(0, 200));
      if (aiRes.status === 429) return json({ error: "Muitos pedidos, tente daqui a pouco." }, 429);
      if (aiRes.status === 402) return json({ error: "Créditos de IA esgotados." }, 402);
      return json({ error: "Erro ao analisar a fatura", diagnostic: { gatewayStatus: aiRes.status, imageBytes } }, 502);
    }

    const aiJson = await aiRes.json();
    const choice = aiJson?.choices?.[0];
    const text: string = typeof choice?.message?.content === "string" ? choice.message.content : "";
    const finishReason: string | null = choice?.finish_reason ?? null;

    const m = text.match(/\{[\s\S]*\}/);
    let raw: unknown = null;
    try { raw = m ? JSON.parse(m[0]) : null; } catch { raw = null; }
    const p = Fatura.safeParse(raw);
    const out = p.success ? p.data : null;

    const filled = out
      ? [out.fornecedor_nome, out.fornecedor_nif, out.numero_fatura, out.data_fatura, out.valor_total]
          .filter((v) => v !== null && v !== "").length
      : 0;
    const diagnostic = { finishReason, outputChars: text.length, imageBytes, filled };
    console.log("scan-fatura result", JSON.stringify(diagnostic));

    if (!out || filled === 0) {
      return json({
        error: "A IA não encontrou dados legíveis na fatura. Tente outra foto, com boa luz e a fatura inteira.",
        diagnostic,
      }, 422);
    }

    // Supplier match: NIF first, then name
    const { data: forns } = await supabase.from("fornecedores").select("id, nome, nif");
    let fornecedor_id: string | null = null;
    const nif = out.fornecedor_nif?.replace(/\D/g, "") || "";
    if (nif && forns) fornecedor_id = forns.find((f) => (f.nif || "").replace(/\D/g, "") === nif)?.id ?? null;
    if (!fornecedor_id && out.fornecedor_nome && forns) {
      const n = norm(out.fornecedor_nome);
      fornecedor_id = forns.find((f) => norm(f.nome) === n)?.id
        ?? forns.find((f) => { const fn = norm(f.nome); return fn.length > 3 && (n.includes(fn) || fn.includes(n)); })?.id
        ?? null;
    }
    return json({ ...out, fornecedor_nif: nif || null, fornecedor_id, diagnostic });
  } catch (e) {
    console.error("scan-fatura error", (e as Error)?.message);
    return json({ error: "Erro ao analisar a fatura" }, 500);
  }
});
