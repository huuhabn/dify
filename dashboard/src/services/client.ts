import Cookies from 'js-cookie';

export const CONSOLE_API_PREFIX = '/console/api';
export const PUBLIC_API_PREFIX = '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return endpoint;
  const url = new URL(endpoint, 'http://localhost');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.pathname + url.search;
}

async function safeParseJson(res: Response): Promise<{ isJson: boolean; data: any; text: string }> {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return { isJson: true, data, text };
  } catch {
    return { isJson: false, data: null, text };
  }
}

export async function consoleApiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, params, headers, ...restOptions } = options;
  const token = typeof window !== 'undefined' ? Cookies.get('console_token') : undefined;

  const resolvedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string>)
  };

  if (!skipAuth && token) {
    resolvedHeaders.Authorization = `Bearer ${token}`;
  }

  const url = buildUrl(`${CONSOLE_API_PREFIX}${endpoint}`, params);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: resolvedHeaders,
      credentials: 'same-origin',
      ...restOptions
    });
  } catch (netErr: any) {
    throw new ApiError(0, 'NETWORK_ERROR', netErr.message || 'Network connection failed');
  }

  const { isJson, data, text } = await safeParseJson(res);

  if (res.status === 401) {
    if (typeof window !== 'undefined' && !skipAuth) {
      Cookies.remove('console_token');
      const isAuthPage =
        window.location.pathname.startsWith('/signin') ||
        window.location.pathname.startsWith('/sign-in') ||
        window.location.pathname.startsWith('/signup') ||
        window.location.pathname.startsWith('/sign-up');
      if (!isAuthPage) {
        const redirect = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/signin?redirect=${redirect}`;
      }
    }
    const errorMsg =
      (isJson && (data?.message || data?.code)) || 'Invalid email or password.';
    throw new ApiError(401, (isJson && data?.code) || 'unauthorized', errorMsg, data);
  }

  if (!res.ok) {
    const errorMsg =
      (isJson && (data?.message || data?.code)) ||
      (text && text.length < 150 ? text : `Server error (${res.status}) - Ensure Dify Backend is running`);
    throw new ApiError(
      res.status,
      (isJson && data?.code) || 'API_ERROR',
      errorMsg,
      data
    );
  }

  if (res.status === 204) {
    return {} as T;
  }

  if (!isJson) {
    throw new ApiError(
      res.status,
      'INVALID_RESPONSE',
      `Unexpected response from backend: ${text.slice(0, 100)}`
    );
  }

  return data as T;
}

export async function publicApiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...restOptions } = options;
  const url = buildUrl(`${PUBLIC_API_PREFIX}${endpoint}`, params);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(headers as Record<string, string>)
      },
      ...restOptions
    });
  } catch (netErr: any) {
    throw new ApiError(0, 'NETWORK_ERROR', netErr.message || 'Network connection failed');
  }

  const { isJson, data, text } = await safeParseJson(res);

  if (!res.ok) {
    const errorMsg =
      (isJson && (data?.message || data?.code)) ||
      (text && text.length < 150 ? text : `Server error (${res.status}) - Ensure Dify Backend is running`);
    throw new ApiError(
      res.status,
      (isJson && data?.code) || 'API_ERROR',
      errorMsg,
      data
    );
  }

  if (res.status === 204) {
    return {} as T;
  }

  if (!isJson) {
    throw new ApiError(
      res.status,
      'INVALID_RESPONSE',
      `Unexpected response from backend: ${text.slice(0, 100)}`
    );
  }

  return data as T;
}
