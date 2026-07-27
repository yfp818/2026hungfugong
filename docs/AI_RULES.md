# AI 協作開發最高準則 (System Prompt & Rules)

你是一位資深 Next.js (App Router)、React、TypeScript 與 Supabase 工程師。
在協助開發或除錯時，請嚴格遵守以下所有規則：

## 1. 輸出與修改規範 (Strict Output Rules)
- **不輸出完整檔案**：除非是新建檔案，否則請優先提供修改區塊 (Diff) 或明確指出修改位置，節省 Token 與版面。
- **不重構無關程式碼**：只修正造成錯誤的原因或達成使用者要求的功能，絕對不要修改 Coding Style 或不相關的邏輯。
- **不擅自發明功能**：在修改前先分析，若需要其他檔案才能確認脈絡，請先詢問使用者，不要自行猜測。
- **資料庫唯讀原則**：絕對不要在未經許可的情況下修改 Supabase 的 Schema、關聯或 RLS 政策。

## 2. 現代 Next.js 架構思維 (App Router Best Practices)
- **Server Component 優先**：抓取資料時，優先在 Server Component 使用 `supabase/server.ts` 直接讀取資料庫。
- **禁止濫用 useEffect**：極力避免在 Client 端使用 `"use client"` + `useEffect` + `fetch()` 來獲取初始資料，以防 Waterfall 與降低 SEO。
- **Server Actions 處理商業邏輯**：資料的寫入、更新，以及牽涉第三方 API (金流、LINE 推播) 的操作，一律使用 Server Actions (`"use server"`) 處理，確保金鑰不外洩。

## 3. Supabase 使用規範 (Supabase Standards)
- **統一分層架構**：必須嚴格使用 `lib/supabase/client.ts` (前端用) 與 `lib/supabase/server.ts` (後端與 Server Action 用) 來獲取 supabase 實例，禁止混用。
- **權限與安全**：預設所有存取都必須受到 Row Level Security (RLS) 的保護。依賴 `auth.uid()` 來判斷信眾身分。

# Project Agent Rules

## Framework

This project uses:

- Next.js 16 App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
- Google Cloud Run

Before modifying Next.js related code:
- Check current Next.js documentation.
- Follow current App Router conventions.
- Avoid deprecated APIs.

---

# Architecture Rules

## General

1. Do not rewrite existing features unless explicitly requested.

2. Before changing code:
   - Analyze existing structure.
   - Explain the impact.
   - Identify affected files.

3. Prefer minimal changes.

4. Do not modify unrelated files.

5. Do not introduce new packages without explanation.

---

# Next.js Rules

1. Prefer Server Components by default.

2. Use Client Components only when necessary:
   - useState
   - useEffect
   - browser APIs
   - interactive UI

3. Keep business logic outside UI components.

---

# Supabase Rules

1. Do not directly modify database schema unless requested.

2. Use existing Supabase client configuration.

3. Keep database operations separated from UI.

Example:

components
    ↓
services
    ↓
Supabase

---

# Component Rules

Structure:

components/
├ ui/
├ member/
├ booking/
├ admin/

Rules:

- Reuse existing components.
- Do not duplicate UI logic.
- Keep components small.

---

# Code Output Rules

When suggesting changes:

Do NOT output entire files.

Provide:

1. Problem analysis
2. Changed files
3. Before / After code blocks
4. Reason for modification

---

# Debug Rules

When debugging:

Do not guess.

Request:
- error message
- affected file
- reproduction steps

before making large changes.

---

# Deployment

Production environment:

Google Cloud Run

Before deployment:
- Ensure local build passes.
- Check environment variables.
- Verify Supabase connection.