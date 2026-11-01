import { NextResponse } from "next/server";
import { HttpError } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof HttpError) {
    return jsonError(error.message, error.status);
  }
  // eslint-disable-next-line no-console
  console.error(error);
  return jsonError("Something went wrong. Please try again.", 500);
}
