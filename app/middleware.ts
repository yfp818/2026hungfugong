import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 🌟 設定允許存取後台的管理員 Email 白名單
const ALLOWED_ADMIN_EMAILS = [
  'your-email@gmail.com', // 替換成您的主要 Email
  'temple-boss@gmail.com'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 只攔截前往 /admin 後台的請求
  if (pathname.startsWith('/admin')) {
    
    /* ----------------------------------------------------
       【機制一】環境變數固定密碼鎖 (Basic Auth)
       ---------------------------------------------------- */
    const authHeader = req.headers.get('authorization');
    const ADMIN_USER = "admin";
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || "hf宮pass888"; // 優先讀取雲端環境變數

    if (!authHeader) {
      return new NextResponse('請輸入後台管理密碼', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin"' },
      });
    }

    const authContent = authHeader.split(' ')[1];
    const [user, pass] = Buffer.from(authContent, 'base64').toString().split(':');

    // 如果固定密碼驗證失敗，直接擋下
    if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
      return new NextResponse('認證認證錯誤，拒絕存取。', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin"' },
      });
    }

    /* ----------------------------------------------------
       【機制二】NextAuth 登入身分與 Email 白名單驗證
       ---------------------------------------------------- */
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // 如果沒有登入，或是登入者的 Email 不在白名單內，則導回首頁或顯示權限不足
    if (!session || !session.email || !ALLOWED_ADMIN_EMAILS.includes(session.email)) {
      // 權限不足，重導向回首頁
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

// 設定 Middleware 攔截器只對 /admin 生效，不影響其他前台頁面效能
export const config = {
  matcher: ['/admin/:path*'],
};