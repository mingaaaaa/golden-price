import type { Metadata } from "next";
// import "./globals.css";  // 暂时禁用，解决 Windows 构建问题

export const metadata: Metadata = {
  title: "黄金价格监控系统",
  description: "实时监控AUTD黄金价格，定时推送钉钉通知",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
