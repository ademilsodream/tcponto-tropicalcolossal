import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createOpenAI } from "npm:@ai-sdk/openai@2";
import { streamText, Output, NoObjectGeneratedError } from "npm:ai@5";
import { z } from "npm:zod@3";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({
  image: z.string().min(100).max(8_000_000),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

const Fatura = z.object({
  fornecedor_nome: z.string().nullable(),
  fornecedor_nif: z.string().nullable(),
  numero_fatura: z.string().nullable(),
  data_fatura: z.string().nullable(),
  valor_total: z.number().nullable(),
});

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

    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system:
        "Lês faturas portuguesas (ou de outros países). Extrai o fornecedor (emitente, não o cliente), o NIF do emitente só com dígitos, o número da fatura tal como impresso, a data de emissão em formato AAAA-MM-DD e o valor total a pagar com IVA como número. Usa null quando não for legível.",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Extrai os dados desta fatura." },
          { type: "image", image: parsed.data.image, mediaType: parsed.data.mimeType },
        ],
      }],
      experimental_output: Output.object({ schema: Fatura }),
      abortSignal: req.signal,
      providerOptions: {
        openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] },
      },
    });
    let out: z.infer<typeof Fatura>;
    try {
      for await (const _ of result.textStream) { /* consume */ }
      out = await result.experimental_output;
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) return json({ error: "Não foi possível ler a fatura. Tente outra foto." }, 422);
      throw e;
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
    return json({ ...out, fornecedor_nif: nif || null, fornecedor_id });
  } catch (e) {
    const status = (e as { statusCode?: number })?.statusCode;
    console.error("scan-fatura error", status, e);
    if (status === 429) return json({ error: "Muitos pedidos, tente daqui a pouco." }, 429);
    if (status === 402) return json({ error: "Créditos de IA esgotados." }, 402);
    return json({ error: "Erro ao analisar a fatura" }, 500);
  }
});
