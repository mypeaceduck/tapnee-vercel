"use client";

import Provider from "@/app/providers";
import App from "@/components/App";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const [gameId, setGameId] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const queryParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : { get: () => null };
    setUserId(encodeURIComponent(queryParams.get("userId") || ""));
    setGameId(encodeURIComponent(params.id));
  }, [params]);

  return (
    <Provider>
      <App gameId={gameId} userId={userId} />
    </Provider>
  );
}
