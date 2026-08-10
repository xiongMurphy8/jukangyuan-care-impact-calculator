import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the finished 聚康源 calculator", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>聚康源｜爱心就业价值测算<\/title>/);
  assert.match(html, /填写两项，立即出结果/);
  assert.match(html, /近12个月内销业务应纳税额/);
  assert.match(html, /上月社保申报在职职工人数/);
  assert.match(html, /由聚康源提供服务/);
  assert.match(html, /等待客户数据/);
  assert.match(html, /填写完成后生成 PDF/);
  assert.match(html, /placeholder="例如 1,200,000"/);
  assert.match(html, /class="eligibility-details"/);
  assert.doesNotMatch(html, /value="1200000"/);
  assert.doesNotMatch(html, /企业名称/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/);
});

test("keeps PDF generation direct and reports failures", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");

  assert.match(page, /import\("html2canvas"\)/);
  assert.match(page, /import\("jspdf"\)/);
  assert.match(page, /download\.download = "聚康源-爱心就业价值测算报告\.pdf"/);
  assert.match(page, /PDF 生成失败，请刷新页面后重试/);
  assert.doesNotMatch(page, /window\.print/);
  assert.match(packageJson, /"html2canvas"/);
  assert.match(packageJson, /"jspdf"/);
});

test("does not count unverified tax benefits as confirmed totals", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /const vatRefund = vatQualified \? vatPotential : 0/);
  assert.match(page, /const fund = employmentQualified \? fundPotential : 0/);
  assert.match(page, /城镇土地使用税","实缴税额 × 当地适用减免比例",null,"待地方核实"/);
  assert.match(page, /现有残疾职工按0人/);
  assert.match(page, /跨自然年度须分年度核验/);
});

test("mobile hero no longer retains the removed illustration height", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /@media\(max-width:680px\).*?\.hero\{min-height:620px\}/s);
  assert.doesNotMatch(css, /@media\(max-width:680px\).*?\.hero\{min-height:900px\}/s);
});
