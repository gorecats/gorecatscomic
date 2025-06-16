"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/Button";
import { ZoomIn, ZoomOut, X, Maximize } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import * as bs58 from "bs58";
import { WalletGate } from "@/components/Wallet/WalletGate";
import { useFetchComicPreview } from "@/queries/preview";
import { WalletGateDialog } from "@/components/Wallet/WalletGateDialog";
import { ButtonLink } from "@/components/ButtonLink";
import { useLocalStorage } from "@/lib/useLocalStorage";

export default function Page() {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showWalletGateDialog, toggleWalletGateDialog] = useState(false);
  const [isWalletAuthenticating, toggleIsWalletAuthenticating] =
    useState(false);
  const hasShownDialogRef = useRef(false);

  const [encoding, setEncoding] = useState<string>();
  const [comicPages, setComicPages] = useState<string[] | undefined>();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const { signMessage, publicKey, connected } = useWallet();

  const [comicPagesCache, setComicPagesCache] = useLocalStorage<
    string[] | undefined
  >("ComicPages", undefined);
  const [authTime, setAuthTime] = useLocalStorage<Date | undefined>(
    "AuthTime",
    undefined
  );
  const {
    data: previewPages,
    isLoading,
    error: fetchPreviewError,
  } = useFetchComicPreview();

  const handleReadAuthorization = async () => {
    if (!signMessage) {
      alert("Something went wrong");
      return;
    }

    toggleIsWalletAuthenticating(true);
    try {
      const response = await fetch("/api/message");
      const json = await response.json();
      const message = new TextEncoder().encode(json.otp);
      const signedMessage = await signMessage(message);
      const encoding = bs58.default.encode(signedMessage);
      setEncoding(encoding);
    } catch (e) {
      alert(e);
    } finally {
      toggleIsWalletAuthenticating(false);
      toggleWalletGateDialog(false);
    }
  };

  async function fetchComicPages() {
    if (authTime) {
      const FIFTY_MINUTES_MS = 50 * 60 * 1000;
      const now = new Date();
      const expiryTime = new Date(authTime.getTime() + FIFTY_MINUTES_MS);

      if (expiryTime > now && comicPagesCache && comicPagesCache.length > 0) {
        console.log("FROM CACHE");
        setComicPages(comicPagesCache);
        setIsAuth(true);
        return;
      }

      console.log("NOT FROM CACHE");
      setAuthTime(undefined);
      setComicPagesCache(undefined);
    }

    const response = await fetch(
      `/api/pages?address=${publicKey}&encoding=${encoding}`
    );

    const text = await response.text();
    if(response.status == 403){
      alert("You're not authorized for full comic access, connect wallet that own gorecats to read full comic");
      return;
    }
    if (!response.ok) throw new Error("Failed to fetch images");

    const json = JSON.parse(text);
    if (!json.images || !Array.isArray(json.images)) {
      throw new Error("Invalid response format");
    }

    setComicPagesCache(json.images);
    setAuthTime(new Date());
    setIsAuth(true);

    const pages = json.images as string[];
    setComicPages(pages);
  }

  useEffect(() => {
    if (encoding && publicKey) {
      fetchComicPages();
    }
  }, [publicKey, encoding]);

  const data = comicPages ?? previewPages;
  const images = data ?? [];
  const totalImages = images.length;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 1));

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  useLayoutEffect(() => {
    if (!images.length) return;

    const container = scrollContainerRef.current;
    if (!container) {
      console.warn("❌ container is still null");
      return;
    }

    const handleScroll = () => {
      const images = container.querySelectorAll(".comic-image");
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      images.forEach((img, index) => {
        const imgRect = img.getBoundingClientRect();
        const imgCenter = imgRect.top + imgRect.height / 2;
        const distance = Math.abs(imgCenter - containerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setCurrentImageIndex(closestIndex);

      const atBottom =
        Math.abs(
          container.scrollHeight - container.scrollTop - container.clientHeight
        ) < 20;

      if (atBottom && !hasShownDialogRef.current) {
        hasShownDialogRef.current = true;
        toggleWalletGateDialog(true);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef, images.length]);

  if (isLoading || totalImages === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Loading Comic...</h3>
          <p className="text-gray-400">Fetching images from secure storage</p>
        </div>
      </div>
    );
  }

  const error = fetchPreviewError;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Failed to Load Images</h3>
          <p className="text-gray-400 mb-4">
            Unable to load the comic from storage, reload!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ButtonLink
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              href={"gorecats.io"}
            >
              <X className="w-5 h-5 mr-2" />
              Exit Reader
            </ButtonLink>

            <div className="h-6 w-px bg-gray-600" />
            <div className="text-sm text-gray-300">Comic Reader</div>
          </div>
        </div>
      </header>

      <div className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 p-2 md:p-3 sticky top-[64px] z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs sm:text-sm text-gray-300 min-w-[60px]">
            Page {currentImageIndex + 1}/{totalImages}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleZoomOut}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-300">
              {Math.round(scale * 100)}%
            </span>
            <Button
              onClick={handleZoomIn}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              onClick={toggleFullscreen}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-auto h-[calc(100dvh-130px)]"
      >
        <WalletGateDialog
          handleReadAuthorization={handleReadAuthorization}
          open={showWalletGateDialog}
          toggleDialog={() => toggleWalletGateDialog(!showWalletGateDialog)}
          isLoading={isWalletAuthenticating}
        />
        <div className="max-w-4xl mx-auto px-2 md:px-8 py-4 space-y-4 sm:space-y-6">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative bg-white shadow-lg rounded-lg border-2 border-yellow-400 overflow-hidden"
            >
              <img
                src={imageUrl}
                alt={`Comic page ${index + 1}`}
                className="w-full h-auto object-contain comic-image"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center top",
                  transition: "transform 0.2s ease-in-out",
                }}
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono z-10">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
        {!(isAuth && connected && encoding) && (
          <WalletGate
            handleReadAuthorization={handleReadAuthorization}
            isLoading={isWalletAuthenticating}
          />
        )}
      </main>
    </div>
  );
}
