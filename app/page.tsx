"use client";

import { useMemo, useRef, useState } from "react";

type YesNo = "yes" | "no";
const yuan = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 });
const policies = [
  ["增值税", "财税〔2016〕52号", "促进残疾人就业增值税优惠政策", "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5203716/content.html"],
  ["残保金", "财税〔2015〕72号", "残疾人就业保障金征收使用管理办法", "https://szs.mof.gov.cn/zt/mlqd_8464/zcgd/201706/t20170616_2624957.htm"],
  ["所得税", "工资100%加计扣除", "安置残疾人员就业企业所得税优惠解读", "https://zhejiang.chinatax.gov.cn/art/2026/6/5/art_13314_655635.html"],
  ["土地税", "财税〔2010〕121号", "安置残疾人就业单位城镇土地使用税政策", "https://fgk.chinatax.gov.cn/zcfgk/c102416/c5203544/content.html"],
];
function n(v: string) { const x = Number(v.replace(/,/g, "")); return Number.isFinite(x) && x >= 0 ? x : 0; }
function formatThousands(v: string) {
  if (!v) return "";
  const [integer, decimal] = v.replace(/,/g, "").split(".");
  const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimal !== undefined ? `${formatted}.${decimal}` : formatted;
}
function cleanAmount(v: string) {
  const cleaned = v.replace(/,/g, "").replace(/[^\d.]/g, "");
  const [integer, ...decimals] = cleaned.split(".");
  return decimals.length ? `${integer}.${decimals.join("").slice(0, 2)}` : integer;
}
function Toggle({ value, set, label }: { value: YesNo; set: (v: YesNo) => void; label: string }) { return <div className="toggle" role="group" aria-label={label}><button type="button" aria-pressed={value === "yes"} className={value === "yes" ? "active" : ""} onClick={() => set("yes")}>是</button><button type="button" aria-pressed={value === "no"} className={value === "no" ? "active no" : ""} onClick={() => set("no")}>否</button></div>; }

export default function Home() {
  const [vat, setVat] = useState("");
  const [people, setPeople] = useState("");
  const [minWage, setMinWage] = useState("2300");
  const [avgWage, setAvgWage] = useState("90000");
  const [salary, setSalary] = useState("3000");
  const [social, setSocial] = useState("900");
  const [taxRate, setTaxRate] = useState("25");
  const [business, setBusiness] = useState("manufacturing");
  const [revenue, setRevenue] = useState<YesNo>("yes");
  const [separate, setSeparate] = useState<YesNo>("yes");
  const [employment, setEmployment] = useState<YesNo>("yes");
  const [grade, setGrade] = useState("A");
  const [generating, setGenerating] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");
  const reportRef = useRef<HTMLElement>(null);

  const c = useMemo(() => {
    const ready = vat.trim() !== "" && people.trim() !== "";
    const head = n(people), hires = people.trim() ? Math.max(Math.ceil(head / 3), 10) : 0;
    const ratio = head + hires ? hires / (head + hires) : 0;
    const vatLimit = hires * n(minWage) * 4 * 12;
    const vatPotential = Math.min(n(vat), vatLimit);
    const fundPotential = head * .015 * n(avgWage);
    const incomeTaxPotential = hires * n(salary) * 12 * n(taxRate) / 100;
    const cost = hires * (n(salary) + n(social)) * 12;
    const businessOk = ["manufacturing", "processing", "services"].includes(business);
    const creditOk = ["A", "B", "M"].includes(grade);
    const vatQualified = businessOk && revenue === "yes" && separate === "yes" && creditOk && employment === "yes";
    const employmentQualified = employment === "yes";
    const vatRefund = vatQualified ? vatPotential : 0;
    const fund = employmentQualified ? fundPotential : 0;
    const incomeTax = employmentQualified ? incomeTaxPotential : 0;
    const total = vatRefund + fund + incomeTax;
    const eligible = vatQualified && employmentQualified;
    const issues = [!businessOk && "业务性质", revenue === "no" && "优惠业务收入占比", separate === "no" && "分别核算", employment === "no" && "合规用工", !creditOk && "纳税信用"].filter(Boolean).join("、");
    return { ready, hires, ratio, vatPotential, fundPotential, incomeTaxPotential, vatRefund, fund, incomeTax, total, cost, net: total - cost, eligible, vatQualified, employmentQualified, issues };
  }, [people, minWage, vat, avgWage, salary, taxRate, social, business, revenue, separate, employment, grade]);

  async function makePdf() {
    if (generating || !reportRef.current) return;
    if (!c.ready) {
      setPdfMessage("请先填写上方两项客户数据");
      document.querySelector("#calculator")?.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => document.querySelector<HTMLInputElement>(".amount-input")?.focus(), 450);
      return;
    }
    setGenerating(true);
    setPdfMessage("");
    try {
      await document.fonts.ready;
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: 794,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const widthMm = 190, heightMm = 277;
      const pagePixels = Math.floor(canvas.width * heightMm / widthMm);
      let offset = 0, page = 0;
      while (offset < canvas.height) {
        const height = Math.min(pagePixels, canvas.height - offset);
        const slice = document.createElement("canvas");
        slice.width = canvas.width; slice.height = height;
        slice.getContext("2d")?.drawImage(canvas, 0, offset, canvas.width, height, 0, 0, canvas.width, height);
        if (page > 0) pdf.addPage();
        pdf.addImage(slice.toDataURL("image/jpeg", .94), "JPEG", 10, 10, widthMm, height / canvas.width * widthMm, undefined, "FAST");
        offset += height; page += 1;
      }
      const blobUrl = URL.createObjectURL(pdf.output("blob"));
      const download = document.createElement("a");
      download.href = blobUrl;
      download.download = "聚康源-爱心就业价值测算报告.pdf";
      document.body.appendChild(download);
      download.click();
      download.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
      setPdfMessage("PDF 已生成，请查看浏览器下载记录");
    } catch (error) {
      console.error("PDF generation failed", error);
      setPdfMessage("PDF 生成失败，请刷新页面后重试");
    } finally { setGenerating(false); }
  }

  function clearCustomerData() {
    setVat("");
    setPeople("");
    setPdfMessage("");
  }

  return <main>
    <nav className="nav shell screen-only"><a className="brand" href="#top"><i>♥</i><span><b>聚康源</b><small>企业残疾人就业综合服务机构</small></span></a><div><a href="#calculator">开始测算</a><a href="#policies">政策依据</a><button onClick={makePdf}>生成 PDF 报告</button></div></nav>

    <header id="top" className="hero screen-only"><div className="shell hero-grid"><div><p className="eyebrow">JU KANG YUAN · INCLUSIVE EMPLOYMENT</p><h1>爱心就业<br/><span>价值测算</span></h1><p className="intro">由聚康源提供服务。客户填写两项数据，即可快速查看建议配置人数与年度价值。</p><div className="hero-actions"><button onClick={() => document.querySelector("#calculator")?.scrollIntoView({ behavior: "smooth" })}>开始测算 →</button><small>数据本地计算 · 政策来源可追溯</small></div></div><div className="hero-proof"><div><b>25%</b><span>目标安置比例</span></div><div><b>4×</b><span>最低工资月限额</span></div><div><b>100%</b><span>工资加计扣除</span></div></div></div></header>

    <section id="calculator" className="calculator screen-only"><div className="shell"><div className="section-title"><small>CARE IMPACT CALCULATOR</small><h2>填写两项，立即出结果</h2><p>不保存客户数据。金额自动添加千位符，结果会随输入实时更新。</p></div><div className="calc-grid"><div className="form-card">
      <div className="step step-with-action"><i>01</i><span><b>填写客户数据</b><small>两项都填写后即可生成报告</small></span><button type="button" onClick={clearCustomerData}>清空</button></div>
      <div className="fields"><label><b>近12个月内销业务应纳税额 <em>必填</em></b><div><span>¥</span><input aria-label="近12个月内销业务应纳税额" className="amount-input" value={formatThousands(vat)} placeholder="例如 1,200,000" inputMode="decimal" onChange={e => { setVat(cleanAmount(e.target.value)); setPdfMessage(""); }}/><small>元</small></div><small>请填写申报表累计数；跨年度需再分年度核实</small></label><label><b>上月社保申报在职职工人数 <em>必填</em></b><div><span>人</span><input aria-label="上月社保申报在职职工人数" value={people} placeholder="例如 36" inputMode="numeric" onChange={e => { setPeople(e.target.value.replace(/\D/g,"")); setPdfMessage(""); }}/><small>在职</small></div><small>当前按现有残疾职工0人、人数向上取整估算</small></label></div>
      <details className="eligibility-details"><summary><span><b>核实优惠资格</b><small>{c.eligible ? "当前按符合基础条件估算，可展开修改":"存在待核实条件，展开查看"}</small></span><i>＋</i></summary><div className="checks"><div><span><b>企业主要业务性质</b><small>批发零售外购商品通常不适用</small></span><select aria-label="企业主要业务性质" value={business} onChange={e => setBusiness(e.target.value)}><option value="manufacturing">生产制造 / 自有产品</option><option value="processing">加工、修理修配</option><option value="services">符合范围的现代 / 生活服务</option><option value="retail">批发零售外购商品</option><option value="other">其他 / 暂不确定</option></select></div><div><span><b>符合范围业务收入占比 ≥ 50%</b><small>以增值税收入为口径</small></span><Toggle label="符合范围业务收入占比是否达到50%" value={revenue} set={setRevenue}/></div><div><span><b>优惠业务能够分别核算</b><small>与不享受优惠业务分开核算</small></span><Toggle label="优惠业务是否能够分别核算" value={separate} set={setSeparate}/></div><div><span><b>真实合规安排残疾职工上岗</b><small>合同、上岗、社保及银行发薪</small></span><Toggle label="是否真实合规安排残疾职工上岗" value={employment} set={setEmployment}/></div><div><span><b>企业纳税信用等级</b><small>C、D级及暂不确定均需先核实</small></span><select aria-label="企业纳税信用等级" value={grade} onChange={e => setGrade(e.target.value)}><option>A</option><option>B</option><option>M</option><option>C</option><option>D</option><option>暂不确定</option></select></div></div></details>
      <details><summary><span><b>调整内部测算参数</b><small>不同地区或企业可在这里修改</small></span><i>＋</i></summary><div className="params"><label htmlFor="minimum-wage">当地月最低工资<div><input id="minimum-wage" value={minWage} inputMode="decimal" onChange={e=>setMinWage(cleanAmount(e.target.value))}/><small>元</small></div></label><label htmlFor="average-wage">企业年平均工资<div><input id="average-wage" value={avgWage} inputMode="decimal" onChange={e=>setAvgWage(cleanAmount(e.target.value))}/><small>元</small></div></label><label htmlFor="disabled-salary">残疾职工预计月工资<div><input id="disabled-salary" value={salary} inputMode="decimal" onChange={e=>setSalary(cleanAmount(e.target.value))}/><small>元</small></div></label><label htmlFor="social-cost">企业月度社保等成本<div><input id="social-cost" value={social} inputMode="decimal" onChange={e=>setSocial(cleanAmount(e.target.value))}/><small>元</small></div></label><label htmlFor="income-tax-rate">企业所得税率<div><input id="income-tax-rate" value={taxRate} inputMode="decimal" onChange={e=>setTaxRate(cleanAmount(e.target.value))}/><small>%</small></div></label></div></details>
    </div><aside className="live"><div className="live-head"><b>实时测算</b><span>由聚康源提供服务</span></div><div className="live-number"><small>{!c.ready ? "等待客户数据":c.eligible ? "预计年度净收益":"当前条件下年度净收益"}</small><strong>{c.ready ? yuan.format(c.net):"—"}</strong><span>{c.ready ? "仅计入当前筛选条件满足的项目，再扣除预计新增用工成本":"填写左侧两项必填数据后，结果将在这里出现"}</span></div><div className="stats"><div><small>建议配置</small><b>{c.ready ? c.hires:"—"}{c.ready && <i>人</i>}</b></div><div><small>招聘后占比</small><b>{c.ready ? (c.ratio*100).toFixed(1):"—"}{c.ready && <i>%</i>}</b></div><div><small>已计入优惠</small><b>{c.ready ? (c.total/10000).toFixed(1):"—"}{c.ready && <i>万</i>}</b></div></div><div className={`status ${!c.ready ? "idle":c.eligible ? "ok":"warn"}`}><i>{!c.ready ? "1":c.eligible ? "✓":"!"}</i><span><b>{!c.ready ? "请先填写两项数据":c.eligible ? "按当前条件初步可行":"当前存在待完善条件"}</b><small>{!c.ready ? "只需两项数据，填写内容不会保存":c.eligible ? "建议展开资格筛选进一步核实":`${c.issues}需要核实，未满足项目暂不计入合计`}</small></span></div><button className="pdf" disabled={generating || !c.ready} onClick={makePdf}>{generating ? "正在生成 PDF…":c.ready ? "直接下载 PDF 报告 →":"填写完成后生成 PDF"}</button><p>PDF 使用当前填写的数据，点击后直接下载。</p>{pdfMessage && <p className="pdf-message" role="status">{pdfMessage}</p>}</aside></div></div></section>

    <section className="results screen-only"><div className="shell"><div className="result-head"><div><small>EXECUTIVE VIEW</small><h2>老板一眼看懂的年度价值</h2><p>爱心就业价值测算 · 由聚康源提供服务</p></div><button disabled={!c.ready || generating} onClick={makePdf}>{c.ready ? "生成 PDF 报告":"填写数据后生成"}</button></div><ResultContent c={c}/></div></section>

    <section id="policies" className="policies screen-only"><div className="shell"><div className="policy-head"><div><small>POLICY TRANSPARENCY</small><h2>服务由聚康源提供，<br/>政策以官方文件为准</h2></div><p>聚康源为企业服务机构，不是政策发布单位。点击卡片可直接查看财政、税务等主管部门发布的官方文件。</p></div><div className="policy-grid">{policies.map((p,i)=><a key={p[1]} href={p[3]} target="_blank" rel="noreferrer"><div><span>{p[0]}</span><i>0{i+1}</i></div><h3>{p[2]}</h3><b>{p[1]}</b><small>查看官方原文 ↗</small></a>)}</div></div></section>

    <section ref={reportRef} className={`print-report ${generating ? "exporting":""}`}><div className="print-brand"><div className="print-logo">♥</div><div><b>聚康源</b><span>企业残疾人就业综合服务机构</span></div><small>JU KANG YUAN · CARE IMPACT</small></div><div className="print-title"><p>爱心就业价值测算报告</p><h1>企业初步测算报告</h1><div><span>报告性质：初步评估</span><span>服务机构：聚康源</span><span>生成日期：{new Date().toLocaleDateString("zh-CN")}</span></div></div><div className="print-inputs"><h2>客户填写数据</h2><div><span>近12个月内销业务应纳税额<strong>¥ {formatThousands(vat || "0")} 元</strong></span><span>上月社保申报在职职工人数<strong>{formatThousands(people || "0")} 人</strong></span></div></div><h2 className="print-section-title">核心测算结论</h2><div className="print-summary"><span className="hero-metric">当前计入净收益<strong>{yuan.format(c.net)}</strong></span><span>建议配置人数<strong>{c.hires} 人</strong></span><span>招聘后占比<strong>{(c.ratio*100).toFixed(2)}%</strong></span></div><div className={`print-status ${c.eligible ? "ok":"warn"}`}><b>{c.eligible ? "初步符合资格筛选条件":"存在待完善条件"}</b><span>{c.eligible ? "建议进入企业资料核验与正式方案设计。":`${c.issues}需要进一步核实；不满足条件的项目已暂不计入优惠合计。`}</span></div><h2 className="print-section-title">年度价值明细</h2><ResultContent c={c}/><div className="print-assumptions"><h3>测算假设与风险提示</h3><p>现有残疾职工按0人；近12个月“内销业务应纳税额”仅作为快速代理值，跨自然年度须分年度核验；残保金按1.5%基础口径估算，仍需核验当地工资上限与征收系数；城镇土地使用税因缺少当地减免比例暂不计入。实际优惠受企业业务结构、纳税年度、人员真实上岗、社保工资、纳税信用及当地执行口径影响。</p></div><div className="print-policies"><h3>主要政策依据</h3>{policies.map(p=><div key={p[1]}><b>{p[0]}｜{p[1]}</b><span>{p[2]}</span><small>{p[3]}</small></div>)}</div><div className="print-footer"><b>由聚康源提供测算与企业服务</b><p>聚康源不是政策发布或审批单位。本报告仅供经营决策参考，不构成税务、法律或政府审批结论，最终以企业实际情况及主管部门审核口径为准。</p></div></section>

    <footer className="screen-only"><div className="shell"><a className="brand" href="#top"><i>♥</i><span><b>聚康源</b><small>企业残疾人就业综合服务机构</small></span></a><p>爱心就业价值测算由聚康源提供服务。聚康源不是政策发布单位，所有政策内容以主管部门官方文件及实际审核口径为准。</p><a href="#top">回到顶部 ↑</a></div></footer>
  </main>;
}

function ResultContent({ c }: { c: { ready:boolean; vatPotential:number; fundPotential:number; incomeTaxPotential:number; cost:number; total:number; net:number; vatQualified:boolean; employmentQualified:boolean } }) {
  const rows = [["增值税即征即退","人数 × 最低工资 × 4 × 12，与代理税额取低",c.ready ? c.vatPotential:null,c.ready ? c.vatQualified ? "初步计入":"暂不计入":"待填写"],["残保金预计节省","在职人数 × 1.5% × 企业年平均工资",c.ready ? c.fundPotential:null,c.ready ? c.employmentQualified ? "初步计入":"暂不计入":"待填写"],["企业所得税节省","残疾职工工资 × 100% × 所得税率",c.ready ? c.incomeTaxPotential:null,c.ready ? c.employmentQualified ? "初步计入":"暂不计入":"待填写"],["城镇土地使用税","实缴税额 × 当地适用减免比例",null,"待地方核实"],["新增年度用工成本","人数 ×（月工资 + 企业社保等成本）× 12",c.ready ? -c.cost:null,c.ready ? "成本估算":"待填写"]] as const;
  return <><div className="result-cards"><article><span>当前计入的年度税费优惠</span><strong>{c.ready ? yuan.format(c.total):"待填写"}</strong><small>不含条件未满足项目及待核实的土地使用税</small></article><article className="primary"><span>扣除用工成本后的年度净收益</span><strong>{c.ready ? yuan.format(c.net):"待填写"}</strong><small>初步决策指标，最终以主管部门审核为准</small></article></div><div className="data-table"><div className="row head"><span>价值项目</span><span>计算逻辑</span><span>年度潜在金额</span><span>是否计入</span></div>{rows.map(r=><div className="row" key={r[0]}><b>{r[0]}</b><span>{r[1]}</span><strong>{!c.ready && r[0] !== "城镇土地使用税" ? "待填写":r[2] === null ? "待核实":yuan.format(r[2])}</strong><em>{r[3]}</em></div>)}</div></>;
}
