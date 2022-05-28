import { API_ROOT } from "../App";

/* Allows 4xx/5xx errors to be caught by checking response status */
const fetchWithErrorHandling = (url, args) =>
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...args,
  }).then(async (r) => {
    if (r.ok)
      // We avoid parsing empty response (aka HTTP 204 No Content)
      // to avoid throwing invalid JSON parse errors
      return r.status !== 204 && r.json();
    else {
      // const html = await r.text()
      // throw new Error(html)
      const json = await r.json();
      throw new Error(JSON.stringify(json, undefined, 2));
    }
  });

export const getType = (type) =>
  fetchWithErrorHandling(`${API_ROOT}/${type.apiName}`);

export const createType = (item, type) =>
  fetchWithErrorHandling(`${API_ROOT}/${type.apiName}`, {
    method: "POST",
    body: JSON.stringify(item),
  });

export const updateType = (item, type) =>
  fetchWithErrorHandling(`${API_ROOT}/${type.apiName}/${item.id}`, {
    method: "PUT",
    body: JSON.stringify(item),
  });

export const patchType = (item, type) =>
  fetchWithErrorHandling(`${API_ROOT}/${type.apiName}/${item.id}`, {
    method: "PATCH",
    body: JSON.stringify(item),
  });

export const deleteType = (item, type) =>
  fetchWithErrorHandling(`${API_ROOT}/${type.apiName}/${item.id}`, {
    method: "DELETE",
  });
