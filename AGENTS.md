# Codex 專案入口

## 目標

以最少上下文與最少 Token 完成工作。

## 必讀

每次任務只讀：

1. `docs/CORE.md`
2. 與任務直接相關的一份 `modules/*.md`

除非任務需要，不得一次讀取全部文件。

## 模組選擇

- 登入、LINE、權限：`modules/auth.md`
- 會員資料：`modules/member.md`
- 儲值金、交易紀錄：`modules/wallet.md`
- 咖啡寄杯、包月：`modules/coffee.md`
- Supabase、資料表、RLS：`modules/database.md`
- Build、Cloud Run、正式上線：`modules/deployment.md`

需要確認專案位置時才讀：

- `docs/PROJECT_MAP.md`

需要確認功能範圍時才讀：

- `docs/FEATURES.md`

## 工作規則

- 先讀實際程式碼，不得猜測。
- 先分析原因，再提出最小修改方案。
- 只修改必要檔案。
- 不得重構無關程式。
- 不得自行新增套件。
- 不得自行修改登入架構、Secret 或正式環境設定。
- `npm run build` 成功不代表已部署。
- 未經使用者明確要求，不得部署正式環境。

## 回報格式

完成後只回報：

- 問題原因
- 修改檔案
- Build 結果
- 測試方式
- 是否已部署ㄋ