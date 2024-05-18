"use client";

import CreateGame from "@/components/CreateGame";
import Icon, { Butt, Pinata } from "@/components/Icon";
import Logo from "@/components/Logo";
import Modal from "@/components/Modal";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BsPlusSquare } from "react-icons/bs";
import { GiSpinalCoil } from "react-icons/gi";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Page() {
  const { data: games } = useSWR(`/api`, fetcher);
  const [loading, setLoading] = useState(true);

  const [isCreateGameOpen, setCreateGameOpen] = useState(false);

  useEffect(() => {
    if (games) {
      setLoading(false);
    }
  }, [games]);

  return (
    <>
      {loading ? (
        <div className="grid place-items-center h-screen bg-custom-home text-white">
          <div>
            <GiSpinalCoil className="text-6xl animate-spin"></GiSpinalCoil>
            <div>Loading ...</div>
          </div>
        </div>
      ) : (
        <div className="h-screen bg-custom-home relative">
          <div className="grid place-items-center absolute w-full h-screen fill-black/5">
            <div className="w-80">
              <Logo opacity={0.01} />
            </div>
          </div>
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-20">
            {games.map((game: any) => (
              <div key={game.id} className="w-full">
                <Link
                  href={`/game/${game.id}`}
                  onClick={() => setLoading(true)}
                >
                  <div className="group rounded-xl bg-black/20 group-hover:bg-black/40 w-full h-40 grid place-items-center gap-2 p-4 relative">
                    <div className="rounded-br-xl rounded-tl-xl bg-black/40 text-white/20 py-2 px-4 font-extrabold absolute left-0 top-0">
                      #{game.id}
                    </div>
                    <div className="w-20 text-sky-500/40 fill-sky-500/40">
                      <Icon>{game.id === 1 ? <Pinata /> : <Butt />}</Icon>
                    </div>
                    <div className="w-full h-full text-sky-500/40 text-4xl font-extrabold grid place-items-center text-nowrap overflow-hidden">
                      {game.name}
                    </div>

                    <div className="rounded-br-xl rounded-tl-xl bg-black/40 text-white/20 group-hover:text-white py-2 px-4 font-extrabold absolute right-0 bottom-0 animate-pulse">
                      PLAY
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            <div className="w-full">
              <div
                className="group rounded-xl bg-black/20 group-hover:bg-black/40 hover:cursor-pointer w-full h-40 grid place-items-center gap-2 p-4 relative"
                onClick={() => setCreateGameOpen(true)}
              >
                <div className="rounded-br-xl rounded-tl-xl bg-black/40 text-white/20 py-2 px-4 font-extrabold absolute left-0 top-0">
                  #new
                </div>
                <div className="w-20 text-sky-500/40 fill-sky-500/40 flex justify-center items-center">
                  <BsPlusSquare className="text-6xl" />
                </div>
                <div className="w-full h-full text-sky-500/40 text-4xl font-extrabold grid place-items-center text-nowrap overflow-hidden">
                  TITLE
                </div>
                <div className="rounded-br-xl rounded-tl-xl bg-green-500/10 text-white/20 group-hover:text-white py-2 px-4 font-extrabold absolute right-0 bottom-0 animate-pulse">
                  CREATE GAME
                </div>
              </div>
              <Modal
                isOpen={isCreateGameOpen}
                onClose={() => setCreateGameOpen(false)}
              >
                <CreateGame />
              </Modal>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
