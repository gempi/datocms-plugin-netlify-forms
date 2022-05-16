import qs from "qs";
import { ValidParameters } from "../types";

export default class NetlifyClient {
  accessToken: string;

  constructor({ accessToken }: ValidParameters) {
    this.accessToken = accessToken;
  }

  submissionsBySite(
    site: string,
    state?: string,
    per_page?: number,
    page?: number
  ) {
    return this.fetch(`/sites/${site}/submissions/`, "GET", {
      state,
      per_page,
      page,
    });
  }

  deleteSubmission(id: string) {
    return this.fetch(`/submissions/${id}`, "DELETE");
  }

  changeSubmissionState(id: string, state: "ham" | "spam") {
    return this.fetch(`/submissions/${id}/${state}`, "PUT");
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
        return response;
      }
    });
  }
}
