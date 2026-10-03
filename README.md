# 西班牙慢游 · Our Spain Journal

面向 iPhone 的家庭旅行执行工具。Next.js + TypeScript + Tailwind CSS，静态导出，无后端、无登录、无 AI API。

## 本地运行

需要 Node.js 22 或以上版本。

```sh
npm ci
npm run dev
```

打开 http://localhost:3026 。开发模式不注册 Service Worker。

验证正式版本及离线功能：

```sh
npm run typecheck
npm test
npm run build
npm start
```

`npm start` 同样使用 3026 端口，请先停止开发服务。也可用 `PORT=3027 npm start` 在独立端口测试。

## 数据在哪里

- `data/trip.ts`：旅行者、八天主题、每日活动、Plan B、退税清单。
- `data/places.ts`：地点库、亲子/推车/午睡信息、餐食偏好和候选分类。
- `data/bookings.ts`：航班、酒店、火车、门票、亲子活动预订。
- `lib/types.ts`：Trip / TripDay / ItineraryItem / Place / Booking / Traveler 类型。
- `lib/itinerary.ts`：当地时间、下一站、Remi 简化日程、编辑与预订同步逻辑。
- `lib/use-trip.ts`：版本化 localStorage，错误提示、跨窗口同步及离线就绪状态。
- `components/editor.tsx`：有焦点管理的手机编辑抽屉。

改动已有记录时保留 `id`。例如将 10/26 Sant Pau 改为 14:30，修改 `26-sant-pau` 的 `startTime`，以及 `ticket-sant-pau` 预订中的计划时间。也可直接在应用编辑卡片，预订页会同步。

添加餐厅时在 `places.ts` 创建稳定 ID 的地点，再给 `trip.ts` 的对应日期添加引用该 `placeId` 的活动即可。未定时间留空，不填虚构的航班或票面时间。

预订地址修改会同步到关联酒店的地点、地图和回酒店导航。表单内“已预订”只是个人记录，不会购买、改签或取消真实订单。

## 旅行中使用

- 八个日期按钮切换行程。开始旅行后按行程所在地自动选择当天；10/22 使用纽约时区，西班牙日期使用 `Europe/Madrid`，自动处理 10/25 的夏令时结束。
- 下一站排除已完成、跳过和售罄活动。预览未来日期从第一项待办开始，不套用今天的钟点。当天过时的 MUST 仍提醒确认，普通已过时活动留在完整时间轴；不自动标为完成。
- 顺序采用原始地理路线或手动顺序；改时间不会暗中重排路线。未知时段保留“待定”。
- Remi Mode 突出孩子、推车、午睡、洗手间和室内停留。“Remi 累了”保留未完成必做、轻松活动、食物及推车购物；提供返回住宿导航。
- Plan B 为每日静态备选，不代表实时天气、营业或余票。
- 收藏页支持搜索、类别/REMI 筛选、收藏、去过、笔记、新地点及安排日期。
- 预订可编辑时间、状态、确认号、地址、票券 URL 和取消说明。
- `Booking.ticketImage` 支持以后加入图片展示；v1 未实现本地图片上传。

## 保存与离线

本机修改保存于 `spain-journal:v1`，覆盖相同稳定 ID 的基础数据。网站更新不会丢掉本机修改；已覆盖字段会继续优先于源文件。不同设备、浏览器、域名、端口之间不会同步。没有云备份。

旅行概览可导出本机 JSON 备份；v1 不提供导入界面。文件损坏或容量不足时会提示，损坏的原存储不会被默认数据覆盖。

`npm run build` 在 Next 静态导出后生成版本化 `out/sw.js`，预缓存 HTML、JS、CSS、照片、图标和内嵌行程数据。只缓存本站资产，Google Maps 与外部票券链接不缓存。首次联网打开正式站点，等待“已可离线使用”；后续无网也可查看和编辑。

iPhone：用 Safari 打开 HTTPS 正式网址 → 分享 → 添加到主屏幕。HTTP 局域网 IP 通常无法启用 Service Worker；localhost 仅用于本机测试。iOS 真机安装与设备存储回收行为仍需上线后验证。

## 部署

两种平台均为静态托管，不需要数据库、API Key 或环境密钥。

**Vercel**：导入本目录/仓库，采用 `vercel.json`：Build Command `npm run build`，Output Directory `out`，Framework Preset `Other`（关闭自动 Next 服务端部署）。

**Netlify**：导入本目录/仓库，使用 `netlify.toml`：Build `npm run build`，Publish `out`。也可将构建后的 `out/` 手动部署到静态托管。

部署目标为站点根目录 `/`，不支持子目录安装。当前只完成部署配置，尚未发布到 Vercel 或 Netlify。

## 已知待确认内容

- UA120 和海南航空的准确时间、海南航班号、确认号、票券、取消条件。
- Central Family Apartment 31 的准确地址、寄存行李、取钥匙和入住时间。
- 10/24 音乐会与巧克力活动仅候选日期/时间；尚未核实实际场次。
- 米罗活动售罄和 Palo Alto 不在旅行期间开放均按用户提供的信息保存，并未当作实时查询结果。两者未放入主行程。
- 店铺营业、未给出的地址、无障碍细节、洗手间位置和交通时长出发前再确认。不提供虚构的实时步行分钟数。
- 导航使用标准 Google Maps HTTPS 搜索链接；是否交给 iPhone 原生 App 取决于设备与安装情况，未在真机验证。

## 验证

`npm test` 使用 Node test runner，覆盖日期/ID/地点引用、时区与夏令时、下一站、Remi 简化逻辑、编辑和跨日移动、预订同步、重排、地图编码、酒店地址同步与损坏存储处理。

浏览器验证记录见 `VERIFICATION.md`。

## 来源与图片

- 退税说明：[Aena 官方流程](https://www.aena.es/en/passengers/baggage-controls/customs-vat-refund/vat-refund.html)。需根据实际航站楼、票据类型和机场指示办理。
- 首页图片：用户提供的桂尔公园截图，作为本地应用素材使用。
