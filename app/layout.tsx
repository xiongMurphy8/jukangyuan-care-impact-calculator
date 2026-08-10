import type { Metadata } from "next";
import "./globals.css";
import "./mobile-report.css";
export const metadata: Metadata = { title: "聚康源｜爱心就业价值测算", description: "由聚康源提供服务的企业残疾人就业税费优惠与年度净收益测算工具。" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
