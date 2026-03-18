import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { getClerkWebhookSecret } from "@/env";
import { upsertUser } from "@/modules/users/users.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  let event: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    event = await verifyWebhook(request, {
      signingSecret: getClerkWebhookSecret(),
    });
  } catch (error) {
    console.error("[clerk-webhook] invalid signature", { requestId, error });
    return NextResponse.json(
      { error: "invalid signature", requestId },
      { status: 401 },
    );
  }

  try {
    if (!event?.type || !event?.data) {
      return NextResponse.json(
        { error: "bad payload", requestId },
        { status: 400 },
      );
    }

    if (event.type === "user.created") {
      const data = event.data as {
        id?: string;
        username?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        image_url?: string | null;
        email_addresses?: Array<{ email_address?: string }>;
      };

      if (!data.id) {
        return NextResponse.json(
          { error: "bad payload", requestId },
          { status: 400 },
        );
      }

      const email = data.email_addresses?.[0]?.email_address ?? null;
      await upsertUser({
        clerkUserId: data.id,
        email,
        username: data.username ?? null,
        firstName: data.first_name ?? null,
        lastName: data.last_name ?? null,
        imageUrl: data.image_url ?? null,
      });
    }

    return NextResponse.json({ ok: true, requestId });
  } catch (error) {
    console.error("[clerk-webhook] unhandled error", { requestId, error });
    return NextResponse.json(
      { error: "internal error", requestId },
      { status: 500 },
    );
  }
}
