# 聚康源｜爱心就业价值测算

- 腾讯云：https://canbaojin-d7gfb2yfg490fc759-1427274058.tcloudbaseapp.com/jukangyuan/
- GitHub Pages：https://xiongmurphy8.github.io/jukangyuan-care-impact-calculator/

## 当前发布方式

`release/` 是 2026-08-31 用户确认的页面版本。使用线上公开构建包作为固定基线，通过确定性脚本仅替换首屏及批准的展示文案，再叠加响应式样式和主题/键盘适配。保留原测算、PDF 分包、咨询提交和客户记录入口。

仓库原有 `app/` 源码比当前线上包旧，缺少部分功能，因此本次没有用旧源码覆盖线上功能。`npm run build` 仍构建旧 vinext 源码，**不要将该产物误用为本次发布版本**。未来应先补齐最新业务源码，再迁移这层展示补丁。

## 确定性构建（Python 3.10+，无外部依赖）

```sh
python3 release/verify.py
# 或 npm run test:release
python3 release/build.py tencent-dist
python3 release/build.py github-pages-dist
```

两处输出字节一致，所有路径相对页面目录，适用于腾讯云 `/jukangyuan/` 及 GitHub Pages 仓库子目录。资源放入内容摘要命名的目录，PDF 内部相对导入保留原文件名；`release-manifest.json` 记录每个文件 SHA-256。

- `release/baseline/`：原公开业务包、CSS、PDF 分包及已批准的 WebP 场景图。
- `release/patch.py`：首屏和有限展示字符串变更。
- `release/redesign.css`：浅深色及桌面/手机样式。
- `release/production.js`：显示模式、弹窗键盘操作。没有本地预览的提交拦截。
- `release/evidence/`：前期视觉检查及图片生成说明，不含客户资料。

## 发布与回退

推送到原默认分支 `agent/publish-care-calculator` 会触发 GitHub Pages 工作流；构建前运行完整性验证。

腾讯云环境 `canbaojin-d7gfb2yfg490fc759`，仅发布 `jukangyuan/`。先上传 `tencent-dist/assets` 到 `jukangyuan/assets`，再上传清单，最后上传 `index.html`。不删除旧资源或修改其他站点目录。回退时恢复发布前备份的 `jukangyuan/index.html`。

## 已知限制

咨询继续使用既有 `https://jukangyuan-aixin-calculator.xiongmurphy4.chatgpt.site/api/leads`，本次不迁移客户数据或后台。2026-08-31 OPTIONS 检查显示：接口允许 GitHub Pages 域名，但尚未允许腾讯云域名；因此腾讯云直接提交咨询仍会受 CORS 限制。需在原后端加入精确的腾讯云 Origin，并复核后台 API 是否支持 `x-admin-token`，不能用前端绕过跨域保护。未提交真实客户资料，也不宣称客户留存端到端验证通过。页面现有“复制咨询信息”可供人工转交。

保留原业务计算规则，本次只做已批准的展示发布，不构成政策或税务逻辑复核。当前页面使用用户提供的 4 张日常工作实拍，已替换 AI 示意图。图片仅做方向校正、缩放和 WebP 压缩，不保留 EXIF；原始照片未上传，来源用 SHA-256 记录在 `release/photos.json`。

四项官方政策原文卡片已恢复到测算结果之后的政策说明区；导航和首屏政策链接仍通过 `#policies` 直达该板块。实拍照片与其他展示调整保持不变。
