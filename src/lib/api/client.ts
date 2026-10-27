import ky, { isHTTPError, isNetworkError, isTimeoutError, type Options } from "ky";

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};

type ApiErrorBody = {
  message?: string;
};

export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function apiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) throw new ApiError("آدرس سرور تنظیم نشده است. متغیر NEXT_PUBLIC_API_BASE_URL را مقداردهی کنید.");
  return `${base.replace(/\/+$/, "")}/`;
}

function toApiError(error: unknown): ApiError {
  if (isHTTPError(error)) {
    const status = error.response.status;
    if (status === 429) return new ApiError("درخواست ها زیاد شده است. یک دقیقه صبر کنید و دوباره تلاش کنید.", status);

    const body = error.data as ApiErrorBody | undefined;
    return new ApiError(body?.message || "درخواست ناموفق بود.", status);
  }

  if (isTimeoutError(error)) return new ApiError("سرور به موقع پاسخ نداد. دوباره تلاش کنید.");
  if (isNetworkError(error)) return new ApiError("ارتباط با سرور برقرار نشد. اتصال اینترنت یا آدرس سرور را بررسی کنید.");

  return new ApiError("خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.");
}

export async function apiRequest<T>(path: string, options: Options = {}): Promise<T> {
  const baseUrl = apiBaseUrl();

  try {
    const response = await ky(path, {
      ...options,
      baseUrl,
      headers: { Accept: "application/json", ...options.headers },
    });
    const body = (await response.json()) as ApiEnvelope<T>;
    return body.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export function apiErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.";
}
