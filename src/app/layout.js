// import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./contexts/AppContext";

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
        <AppProvider>
          {children}
          <Toaster />
          {/* loading full screen */}
          <div className="loading position-fixed" id="loading-full-screen">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
