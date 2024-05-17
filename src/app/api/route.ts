import { GET as G } from "@/app/api/methods/GET";
import { GET as GD } from "@/app/api/methods/GET-dev";
import { POST as P } from "@/app/api/methods/POST";
import { POST as PD } from "@/app/api/methods/POST-dev";
import { NextRequest } from "next/server";

export const GET = (request: NextRequest) =>
  process.env.NODE_ENV === "development" ? GD(request) : G(request);
export const POST = (request: NextRequest) =>
  process.env.NODE_ENV === "development" ? PD(request) : P(request);
