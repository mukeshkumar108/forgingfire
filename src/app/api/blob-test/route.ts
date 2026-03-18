import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getBlobReadWriteToken } from "@/env";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const token = getBlobReadWriteToken();

  const blob = await put("hello.txt", "hello from nextstarter", {
    access: "public",
    addRandomSuffix: true,
    token,
  });

  return NextResponse.json({ url: blob.url });
}
