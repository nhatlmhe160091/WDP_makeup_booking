// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./contexts/AppContext";
import { Providers } from "./providers";
import Script from "next/script";
import 'bootstrap/dist/css/bootstrap.min.css';
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* favicon */}
        <link rel="icon" href="/img/MuaHub.png" />
        <title>MuaHub - Đặt lịch Makeup</title>
        <meta name="theme-color" content="#ff5c95ff" />
      </head>
      <body>
        <Providers>
          <AppProvider>
            {children}
            <Toaster />
            {/* Botpress webchat inject - load sau khi trang tương tác */}
            <Script
              src="https://cdn.botpress.cloud/webchat/v3.3/inject.js"
              strategy="afterInteractive"
            />
            {/* Script botpress content (defer) - đặt sau inject.js */}
            <Script
              src="https://files.bpcontent.cloud/2025/11/07/06/20251107065809-TY9VOLUP.js"
              strategy="afterInteractive"
              defer
            />
            {/* loading full screen */}
            {/* <div className="loading position-fixed" id="loading-full-screen">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div> */}
          </AppProvider>
        </Providers>
      </body>
    </html>
  );
}
