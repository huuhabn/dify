export class ApiError extends Error {
  constructor(
    public status: number,
    override readonly message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
};

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', headers = {}, body, params } = options;

  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const csrfMatch =
    typeof document !== 'undefined'
      ? document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
      : null;
  const csrfToken = csrfMatch ? decodeURIComponent(csrfMatch[1]!) : undefined;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (csrfToken && !requestHeaders['X-CSRF-Token']) {
    requestHeaders['X-CSRF-Token'] = csrfToken;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'same-origin',
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    const message =
      typeof errorData === 'object' && errorData !== null && 'message' in errorData
        ? String((errorData as { message: unknown }).message)
        : `Request failed with status ${response.status}`;

    throw new ApiError(response.status, message, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
