export class FetchError extends Error {
  info: any;
  status: number;

  constructor(message: string, info: any, status: number) {
    super(message);
    this.info = info;
    this.status = status;
  }
}

export const fetcher = async <T = any>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    let info: any = {};
    try {
      info = await res.json();
    } catch {
      // not json
    }
    throw new FetchError(
      info?.error || info?.message || `Request failed with status ${res.status}`,
      info,
      res.status
    );
  }
  return res.json();
};
