export class FetchError<TInfo = unknown> extends Error {
  readonly info: TInfo;
  readonly status: number;

  constructor(message: string, info: TInfo, status: number) {
    super(message);
    this.name = "FetchError";
    this.info = info;
    this.status = status;
  }
}

interface ErrorPayload {
  error?: string;
  message?: string;
}

export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    let info: ErrorPayload = {};
    try {
      info = (await res.json()) as ErrorPayload;
    } catch {
      // not json
    }
    throw new FetchError(
      info?.error || info?.message || `Request failed with status ${res.status}`,
      info,
      res.status
    );
  }
  return res.json() as Promise<T>;
};
