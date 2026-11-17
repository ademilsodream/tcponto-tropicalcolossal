import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const ROOT_FOLDER = "1dg83ZulgYLDx2KpXi01oBE55JWBypywq"; // "Cartão Business"
const GW = "https://connector-gateway.lovable.dev/google_drive";
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({
  image: z.string().min(100).max(8_000_000),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileName: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Sessão em falta" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return json({ error: "Sessão inválida" }, 401);
    const { data: card } = await supabase.from("business_cards").select("id").eq("employee_id", u.user.id).eq("is_active", true).maybeSingle();
    if (!card) return json({ error: "Sem cartão ativo" }, 403);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: "Dados inválidos" }, 400);
    const lk = Deno.env.get("LOVABLE_API_KEY"), dk = Deno.env.get("GOOGLE_DRIVE_API_KEY");
    if (!lk || !dk) return json({ error: "Google Drive não configurado" }, 500);
    const h = { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": dk };

    const ensureFolder = async (name: string, parent: string) => {
      const q = `name='${name}' and '${parent}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const r = await fetch(`${GW}/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)&supportsAllDrives=true&includeItemsFromAllDrives=true`, { headers: h });
      if (!r.ok) throw new Error(`[${r.status}] ${await r.text()}`);
      const f = (await r.json()).files?.[0];
      if (f) return f.id as string;
      const c = await fetch(`${GW}/drive/v3/files?supportsAllDrives=true&fields=id`, {
        method: "POST", headers: { ...h, "Content-Type": "application/json" },
        body: JSON.stringify({ name, mimeType: "application/vnd.google-apps.folder", parents: [parent] }),
      });
      if (!c.ok) throw new Error(`[${c.status}] ${await c.text()}`);
      return (await c.json()).id as string;
    };
    const [y, m] = parsed.data.date.split("-");
    const yearId = await ensureFolder(y, ROOT_FOLDER);
    const monthId = await ensureFolder(m, yearId);

    const ext = parsed.data.mimeType.split("/")[1].replace("jpeg", "jpg");
    const safeName = parsed.data.fileName.replace(/[\\/:*?"<>|]/g, "-") + "." + ext;
    const boundary = "fatura" + crypto.randomUUID();
    const bytes = Uint8Array.from(atob(parsed.data.image), (ch) => ch.charCodeAt(0));
    const enc = new TextEncoder();
    const head = enc.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: safeName, parents: [monthId] })}\r\n--${boundary}\r\nContent-Type: ${parsed.data.mimeType}\r\n\r\n`);
    const tail = enc.encode(`\r\n--${boundary}--`);
    const body = new Uint8Array(head.length + bytes.length + tail.length);
    body.set(head); body.set(bytes, head.length); body.set(tail, head.length + bytes.length);
    const up = await fetch(`${GW}/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,webViewLink`, {
      method: "POST", headers: { ...h, "Content-Type": `multipart/related; boundary=${boundary}` }, body,
    });
    if (!up.ok) {
      const t = await up.text();
      console.error("drive upload failed", up.status, t);
      return json({ error: "Falha ao enviar para o Google Drive", details: t }, up.status);
    }
    const f = await up.json();
    return json({ drive_file_id: f.id, drive_link: f.webViewLink ?? `https://drive.google.com/file/d/${f.id}/view` });
  } catch (e) {
    console.error("upload-fatura-drive error", e);
    return json({ error: "Erro ao enviar fatura", details: String(e) }, 500);
  }
});
