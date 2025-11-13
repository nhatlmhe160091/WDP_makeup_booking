"use client";
import { useEffect, useState } from "react";
import Script from "next/script";

const BotpressChat = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleInjectLoad = () => {
    console.log('Botpress inject script loaded successfully');
    setIsLoaded(true);
  };

  const handleConfigLoad = () => {
    console.log('Botpress config loaded successfully');
    // Có thể thêm logic để show/hide chat icon
  };

  const handleError = (error) => {
    console.error('Botpress loading failed:', error);
    setHasError(true);
  };

  if (hasError) {
    return null; // Hoặc fallback UI
  }

  return (
    <>
      {/* Botpress webchat inject */}
      <Script
        id="botpress-inject"
        src="https://cdn.botpress.cloud/webchat/v3.3/inject.js"
        strategy="lazyOnload"
        onLoad={handleInjectLoad}
        onError={handleError}
      />
      {/* Botpress config - chỉ load sau khi inject thành công */}
      {isLoaded && (
        <Script
          id="botpress-config"
          src="https://files.bpcontent.cloud/2025/11/07/06/20251107065809-TY9VOLUP.js"
          strategy="lazyOnload"
          onLoad={handleConfigLoad}
          onError={handleError}
        />
      )}
    </>
  );
};

export default BotpressChat;