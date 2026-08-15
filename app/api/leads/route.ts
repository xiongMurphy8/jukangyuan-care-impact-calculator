import { leads } from "@/db/schema";
import { getDb } from "@/db";
import { env } from "cloudflare:workers";

type RuntimeEnv = {
  TENCENT_LEAD_WEBHOOK_URL?: string;
  TENCENT_LEAD_WEBHOOK_TOKEN?: string;
};

const allowedOrigins = new Set([
  "https://jukangyuan-aixin-calculator.xiongmurphy4.chatgpt.site",
  "https://xiongmurphy8.github.io",
  "http://localhost:3000",
  "http://localhost:3001",
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  return {
    "access-control-allow-origin": allowedOrigins.has(origin) ? origin : allowedOrigins.values().next().value,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "vary": "Origin",
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 2000) : "";
}

function numberValue(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

function boolValue(value: unknown) {
  return value === true;
}

async function forwardToTencent(record: Record<string, unknown>, payload: Record<string, unknown>) {
  const runtimeEnv = env as RuntimeEnv;
  const url = runtimeEnv.TENCENT_LEAD_WEBHOOK_URL?.trim();
  if (!url) return false;

  const headers: Record<string, string> = { "content-type": "application/json" };
  const token = runtimeEnv.TENCENT_LEAD_WEBHOOK_TOKEN?.trim();
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ record, payload }),
  });

  return response.ok;
}

export function OPTIONS(request: Request) {
  return new Response(null, { headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const headers = corsHeaders(request);

  try {
    const payload = await request.json() as Record<string, unknown>;
    const contact = (payload.contact ?? {}) as Record<string, unknown>;
    const inputs = (payload.inputs ?? {}) as Record<string, unknown>;
    const parameters = (payload.parameters ?? {}) as Record<string, unknown>;
    const eligibility = (payload.eligibility ?? {}) as Record<string, unknown>;
    const result = (payload.result ?? {}) as Record<string, unknown>;

    const contactName = stringValue(contact.name);
    const contactMethod = stringValue(contact.method);

    if (!contactName || !contactMethod) {
      return Response.json({ error: "请填写称呼和手机或微信" }, { status: 400, headers });
    }

    if (!boolValue(payload.consent)) {
      return Response.json({ error: "请先勾选授权留存信息" }, { status: 400, headers });
    }

    const id = crypto.randomUUID();
    const record = {
      id,
      sourceUrl: stringValue(payload.sourceUrl),
      userAgent: stringValue(request.headers.get("user-agent")),
      contactName,
      contactMethod,
      contactRegion: stringValue(contact.region),
      contactMessage: stringValue(contact.message),
      vatAmount: stringValue(inputs.vat),
      peopleCount: Math.round(numberValue(inputs.people)),
      minWage: stringValue(parameters.minWage),
      avgWage: stringValue(parameters.avgWage),
      salary: stringValue(parameters.salary),
      social: stringValue(parameters.social),
      taxRate: stringValue(parameters.taxRate),
      business: stringValue(eligibility.business),
      revenue: stringValue(eligibility.revenue),
      separate: stringValue(eligibility.separate),
      employment: stringValue(eligibility.employment),
      grade: stringValue(eligibility.grade),
      hires: Math.round(numberValue(result.hires)),
      ratio: String(numberValue(result.ratio)),
      vatPotential: String(numberValue(result.vatPotential)),
      fundPotential: String(numberValue(result.fundPotential)),
      incomeTaxPotential: String(numberValue(result.incomeTaxPotential)),
      totalBenefit: String(numberValue(result.total)),
      annualCost: String(numberValue(result.cost)),
      netBenefit: String(numberValue(result.net)),
      eligible: boolValue(result.eligible),
      issues: stringValue(result.issues),
      leadText: stringValue(payload.leadText),
      rawPayload: JSON.stringify(payload).slice(0, 12000),
    };

    await getDb().insert(leads).values(record);

    let tencentForwarded = false;
    try {
      tencentForwarded = await forwardToTencent(record, payload);
    } catch (error) {
      console.error("Failed to forward lead to Tencent Cloud", error);
    }

    return Response.json({ ok: true, id, tencentForwarded }, { status: 201, headers });
  } catch (error) {
    console.error("Failed to save lead", error);
    return Response.json({ error: "保存失败，请稍后重试" }, { status: 500, headers });
  }
}
