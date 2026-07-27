# 皇府宮 - 功能狀態與開發清單

## 🟢 已完成 (Completed)
- [x] 專案基礎建設 (Next.js 16 + Google Cloud Run)
- [x] UI 系統建置 (Tailwind CSS + shadcn/ui)
- [x] 靜態頁面佈局 (活動頁 campaign、最新消息 news、專案介紹 project)
- [x] 購物車基礎介面 (Cart UI & CartContext)

## 🟡 重構中 (Refactoring in Progress)
- [ ] Supabase 目錄架構分層 (`lib/supabase/client.ts`, `server.ts`, `middleware.ts`)
- [ ] 驗證系統轉換 (將 NextAuth 遷移至 Supabase Auth + LINE Login 以打通 RLS)
- [ ] 頁面渲染優化 (將 `app/member/page.tsx` 等頁面重構為 Server Component 優先)

## 🔴 開發中 / 待開發 (To Do)
- [ ] **信眾會員系統**：會員等級、個人資料編輯
- [ ] **點燈服務系統**：點燈選位、年度點燈紀錄查詢
- [ ] **預約服務系統**：問事時間表、時段鎖定機制
- [ ] **金流與訂單**：串接第三方金流 (如綠界/藍新)、電子發票
- [ ] **後台管理 (Admin)**：訂單管理、信眾管理、內容上架
- [ ] **推播系統**：LINE Message API 自動推播 (預約提醒、付款成功)