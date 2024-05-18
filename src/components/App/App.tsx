"use client";

import {
  Airdrop,
  Butt,
  Claim,
  Icon,
  Improve,
  Invite,
  Modal,
  Pinata,
} from "@/components";
import {
  TonConnectButton,
  useTonAddress,
  useTonConnectUI,
} from "@tonconnect/ui-react";
import { Fireworks } from "fireworks-js";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  GiCubes,
  GiCutDiamond,
  GiDroplets,
  GiSpinalCoil,
  GiThreeFriends,
} from "react-icons/gi";
import { HiArrowLeft } from "react-icons/hi2";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type SlapTextType = { id: number; xPos: string }[];
type TapsType = { count: number; waitFrom: number }[];
type SessionType = {
  count: number;
  max: number;
  percent: number;
  waitFrom: number;
}[];

interface DataType {
  taps: TapsType;
  session: SessionType;
  improvement: number[];
}

export default function App({ gameId, userId }: { gameId: any; userId: any }) {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const { connected } = tonConnectUI ?? {};
  const timestamp = new Date().getTime();

  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [isParticlesActive, setIsParticlesActive] = useState(false);

  const { data, mutate }: { data: DataType; mutate: () => void } = useSWR(
    `/api?gameId=${gameId}&userId=${userId}&address=${address}`,
    fetcher
  );
  const [session, setSession] = useState<SessionType>([]);
  const [taps, setTaps] = useState<TapsType>([]);
  const [slapText, setSlapText] = useState<SlapTextType>([]);
  const [sessionPendings, setSessionPendings] = useState<number[]>([]);

  const [haveAirdrop, setHaveAirdrop] = useState(false);
  const [isAirdropOpen, setAirdropOpen] = useState(false);
  const [isImproveOpen, setImproveOpen] = useState(false);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [isClaimOpen, setClaimOpen] = useState(false);

  const [secretCombination, setSecretCombination] = useState("");
  const [currentCombination, setCurrentCombination] = useState("");
  const [secretActive, setSecretActive] = useState(0);
  const [activeBg, setActiveBg] = useState(`bg-custom-home`);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo(
    () => ({
      hue: { min: 0, max: 360 },
      delay: { min: 15, max: 30 },
      rocketsPoint: { min: 50, max: 50 },
      friction: 0.95,
      gravity: 1.5,
      particles: 50,
      explosion: 5,
      autoresize: true,
      brightness: { min: 50, max: 80 },
      boundaries: {
        x: 0,
        y: 0,
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
      },
      mouse: { click: false, move: false, max: 1 },
    }),
    []
  );

  const getRandomX = (isLeft: boolean): string => {
    return `${(isLeft ? 10 : 40) + Math.random() * 30}%`;
  };

  useEffect(() => {
    setSecretCombination("12122");
  }, []);

  useEffect(() => {
    if (!address) return;
    const add = async () => {
      await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gameId, address }),
      });
    };
    add();
  }, [gameId, address]);

  useEffect(() => {
    setInterval(() => mutate(), 10000);
  }, [mutate]);

  useEffect(() => {
    mutate();
  }, [address, connected, mutate]);

  useEffect(() => {
    if (!data || !data.session) return;
    const timestamp = new Date().getTime();
    const sp = data.session.map((s) =>
      s.percent >= 100 ? timestamp - s.waitFrom : 0
    );
    setSessionPendings(sp);
    setTaps(data.taps);
    setSession(data.session);
  }, [data]);

  const handleClick = async (areaId: number) => {
    setCurrentCombination(currentCombination + areaId);

    const newSlap = {
      id: Date.now(),
      xPos: getRandomX(areaId === 1),
    };
    setSlapText((slaps) => [...slaps, newSlap]);

    setTimeout(() => {
      setSlapText((currentSlaps) =>
        currentSlaps.filter((slap) => slap.id !== newSlap.id)
      );
    }, 3000);

    await fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId, userId, areaId, address }),
    });

    mutate();
  };

  useEffect(() => {
    const timestamp = new Date().getTime();

    if (secretActive && timestamp > secretActive) {
      setCurrentCombination("");
      setSecretActive(0);
      setActiveBg(`bg-custom-home`);
    }

    if (!currentCombination) return;

    if (!secretActive && currentCombination.includes(secretCombination)) {
      setSecretActive(timestamp + 10_000);
      setActiveBg(`bg-custom-radial`);

      if (containerRef.current) {
        const fireworks = new Fireworks(containerRef.current, options);
        fireworks.start();
        setIsConfettiActive(true);
        setHaveAirdrop(true);
        setTimeout(() => {
          setCurrentCombination("");
          setSecretActive(0);
          setActiveBg(`bg-custom-home`);
          fireworks.stop();
          setIsConfettiActive(false);
        }, 10_000);
      }
    }
  }, [secretCombination, currentCombination, secretActive, options]);

  const handleBuy = async () => {
    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
          {
            address: "0QDfMEtcCAEQSbbLQSmB7FrPywZZouwoQ_wYG_vW5Jf47KCx",
            amount: "50000000",
          },
        ],
      };

      const result = await tonConnectUI.sendTransaction(transaction);

      console.log("Transaction was sent successfully", result);
    } catch (e: any) {
      if (e) {
        console.log(
          "You rejected the transaction. Please confirm it to send to the blockchain",
          JSON.stringify(e)
        );
      }
    }
  };

  const getColor = (percentage: any) => {
    const green = Math.round((100 - percentage) * 2.55);
    const red = Math.round(percentage * 2.55);
    return `rgb(${red}, ${green}, 0)`;
  };

  return (
    <>
      {!data ? (
        <div className="grid place-items-center h-screen bg-custom-home text-white">
          <div>
            <GiSpinalCoil className="text-6xl animate-spin"></GiSpinalCoil>
            <div>Loading ...</div>
          </div>
        </div>
      ) : (
        <>
          <div className={`relative flex flex-col h-screen w-full ${activeBg}`}>
            <div
              ref={containerRef}
              className="absolute inset-0 w-full h-screen pointer-events-none"
            ></div>
            <div className="flex justify-between items-center p-4 relative w-full">
              <div className="logo text-white font-extrabold z-10">
                <Link
                  href="/"
                  className="flex gap-2 justify-center items-center"
                >
                  <HiArrowLeft /> HOME
                </Link>
              </div>
              <div className="inset-x-0 top-4 flex justify-center">
                <button
                  className="text-white font-bold py-2 px-4 text-lg border border-blue-900/10 hover:border-blue-900/40 rounded-2xl grid place-items-center gap-2"
                  onClick={() => setClaimOpen(true)}
                >
                  <div className="flex justify-center items-center gap-2">
                    <GiCubes /> Claim
                  </div>
                </button>
              </div>
              <div className="z-10">
                <TonConnectButton />
              </div>
            </div>

            <div className="flex-grow flex items-center justify-center gap-12">
              <div className="w-60 h-60 bg-gradient-to-r relative">
                <Icon
                  handleClick={handleClick}
                  taps={data?.taps}
                  session={data?.session}
                >
                  {gameId === "1" ? (
                    <div className="fill-pink-400">
                      <Pinata />
                    </div>
                  ) : (
                    <div className="fill-yellow-400">
                      <Butt />
                    </div>
                  )}
                </Icon>
                {slapText.map((slap) => (
                  <p
                    key={slap.id}
                    className="text-4xl text-pink-500 absolute opacity-100 animate-scaleFadeOutUp pointer-events-none"
                    style={{
                      left: slap.xPos,
                      top: 80,
                      transition: "opacity 3s ease-out, transform 3s ease-out",
                    }}
                  >
                    {secretActive ? `DOUBLE` : gameId === "1" ? `HIT` : `SLAP`}
                  </p>
                ))}
              </div>
            </div>

            <div className="w-full p-4 flex justify-around">
              <div className="w-full m-4 p-4 text-white rounded-xl backdrop-blur-2xl backdrop-saturate-200 shadow-blur flex justify-between gap-2">
                {taps &&
                  taps.map((tap, i) => {
                    return (
                      <div
                        key={i}
                        className="w-full relative flex justify-center items-center"
                      >
                        <div
                          className="absolute inset-0 rounded-xl p-2 text-center h-full shadow-md transition-all duration-500 ease-linear"
                          style={{
                            width: `${session[i].percent}%`,
                            opacity: 1,
                            backgroundColor: getColor(session[i].percent),
                          }}
                        >
                          {tap && tap.count ? (
                            session[i].percent > 45 ? (
                              tap.count
                            ) : (
                              <>&nbsp;</>
                            )
                          ) : (
                            ``
                          )}
                        </div>
                        <div className="w-full rounded-xl bg-slate-800 p-2 text-center font-extrabold">
                          {tap && tap.count ? (
                            session[i].percent <= 45 ? (
                              tap.count
                            ) : (
                              <>&nbsp;</>
                            )
                          ) : (
                            `0`
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="w-full p-4 flex justify-around">
              <button
                className="text-white font-bold py-3 px-6 text-lg border border-blue-900/10 hover:border-blue-900/40 rounded-2xl grid place-items-center gap-2"
                onClick={() => setImproveOpen(true)}
              >
                <GiCutDiamond className="text-2xl" />
                <div>Improve</div>
              </button>
              <button
                className="text-white font-bold py-3 px-6 text-lg border border-blue-900/10 hover:border-blue-900/40 rounded-2xl grid place-items-center gap-2"
                onClick={() => setAirdropOpen(true)}
              >
                <GiDroplets className="text-2xl" />
                <div>Airdrop</div>
              </button>
              <button
                className="text-white font-bold py-3 px-6 text-lg border border-blue-900/10 hover:border-blue-900/40 rounded-2xl grid place-items-center gap-2"
                onClick={() => setInviteOpen(true)}
              >
                <GiThreeFriends className="text-2xl" />
                <div>Invite</div>
              </button>
            </div>

            <Modal isOpen={isAirdropOpen} onClose={() => setAirdropOpen(false)}>
              <Airdrop active={haveAirdrop} />
            </Modal>
            <Modal isOpen={isInviteOpen} onClose={() => setInviteOpen(false)}>
              <Invite />
            </Modal>
            <Modal isOpen={isImproveOpen} onClose={() => setImproveOpen(false)}>
              <Improve />
            </Modal>
            <Modal isOpen={isClaimOpen} onClose={() => setClaimOpen(false)}>
              <Claim />
            </Modal>
          </div>
        </>
      )}
    </>
  );
}
