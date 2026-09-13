import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json(
      { message: "Autenticação necessária ou token inválido" },
      { status: 401 },
    );
  }

  try {
    const response = await fetch(`${backendUrl}/api/chatbot/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: await request.text(),
      cache: "no-store",
    });

    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor do chatbot." },
      { status: 502 },
    );
  }
}
