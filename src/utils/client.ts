const API_ENDPOINT = "https://api.netlify.com/api/v1";

export type Site = {
  name: string;
  site_id: string;
};

export type Submission = {
  id: string;
  name: string;
  form_name: string;
  created_at: string;
  ordered_human_fields?: { title: string; value: string }[];
};

class NetlifyClient {
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  listSites() {
    return this.fetch<Site[]>("/sites/");
  }

  async listSiteSubmissions(siteId: string, state: string, perPage: number, page: number) {
    const res = await this.request(`/sites/${siteId}/submissions/`, "GET", {
      state,
      per_page: perPage,
      page,
    });
    const submissions = (await res.json()) as Submission[];
    const links = res.headers.get("link")?.split(",");
    const lastPage = Number(links?.[links.length - 1]?.match(/page=(\d+)/)?.[1] ?? page);

    return { submissions, lastPage };
  }

  deleteSubmission(id: string) {
    return this.fetch(`/submissions/${id}`, "DELETE");
  }

  changeSubmissionState(id: string, state: "ham" | "spam") {
    return this.fetch(`/submissions/${id}/${state}`, "PUT");
  }

  private async fetch<T = void>(path: string, method = "GET") {
    const res = await this.request(path, method);
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  private async request(
    path: string,
    method: string,
    params?: Record<string, string | number | undefined>,
  ) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value != null && value !== "") search.set(key, String(value));
    }
    const query = search.toString();

    const res = await fetch(`${API_ENDPOINT}${path}${query ? `?${query}` : ""}`, {
      method,
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Netlify API request failed (${res.status})`);
    }

    return res;
  }
}

let cachedClient: NetlifyClient | undefined;

export function getClient(accessToken: string) {
  if (cachedClient?.accessToken !== accessToken) {
    cachedClient = new NetlifyClient(accessToken);
  }
  return cachedClient;
}
