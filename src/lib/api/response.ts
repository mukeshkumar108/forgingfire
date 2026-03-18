import { NextResponse } from "next/server";

export type ApiError = {
  message: string;
  code: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: ApiError | null;
};

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      error: null,
    },
    { status },
  );
}

export function apiError(status: number, message: string, code: string) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      data: null,
      error: { message, code },
    },
    { status },
  );
}
