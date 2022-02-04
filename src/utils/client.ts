import qs from "qs";
import { ValidParameters } from "../types";

export default class NetlifyClient {
  accessToken: string;

  constructor({ accessToken }: ValidParameters) {
    this.accessToken = accessToken;
  }

  submissionsBySite(site: string, state?: string) {
    return this.fetch(`/sites/${site}/submissions/`, "GET", { state });
  }

  deleteSubmissionById(id: string) {
    return this.fetch(`/submissions/${id}`, "DELETE");
  }

  sites() {
    return this.fetch(`/sites/`, "GET");
  }

  fetch(path: string, method: string, params?: any) {
    return fetch(
      `https://api.netlify.com/api/v1${path}${qs.stringify(params, {
        addQueryPrefix: true,
      })}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    ).then((response) => {
      if (!response.ok) {
        throw Error(`An error has occured: ${response.status}`);
      } else {
        if (response.status === 204) return "";
        return response.json();
      }
    });
  }
}
