"use client";

import { Play } from "lucide-react";
import { Button } from "./Button";
import { useRouter } from "next/navigation";
import { RoutePath } from "@/enums/RoutePath";
import { Comic } from "@/lib/types";

export const ComicSection: React.FC<{ comics: Comic[] }> = ({ comics }) => {
  const router = useRouter();

  return (
    <div className="grid md:grid-cols-3 gap-8 mb-16">
      {comics.map((comic, index) => (
        <div
          key={index}
          className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
        >
          <div className="relative overflow-hidden">
            <img
              src={comic.image}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-xl font-bold">{comic.rarity}</h3>
            </div>
          </div>

          <div className="p-6">
            <Button
              onClick={() => router.push(`${RoutePath.Reader}`)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
