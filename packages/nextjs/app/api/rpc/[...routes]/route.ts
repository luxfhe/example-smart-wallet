import { NextResponse } from "next/server";
import scaffoldConfig from "~~/scaffold.config";

import { getAlchemySepoliaUrl } from "~~/utils/scaffold-eth";

export async function POST(req: Request, { params }: { params: { routes: string[] } }) {
  const body = await req.text();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${scaffoldConfig.alchemyApiKey}`,
  };
  req.headers.forEach((value: string, key: string) => {
    // don't pass the cookie because it doesn't get used downstream
    if (key === "cookie") return;

    headers[key] = value;
  });

  console.log("routes", getAlchemySepoliaUrl() + `/${params.routes.join("/")}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${scaffoldConfig.alchemyApiKey}`,
      ...headers,
    },
    body,
  });

  const res = await fetch(getAlchemySepoliaUrl() + `/${params.routes.join("/")}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${scaffoldConfig.alchemyApiKey}`,
      ...headers,
    },
    body,
  });

  console.log("routes", res);

  if (!res.ok) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return NextResponse.json(await res.json().catch(e => ({})), {
      status: res.status,
    });
  }

  return NextResponse.json(await res.json());
}
