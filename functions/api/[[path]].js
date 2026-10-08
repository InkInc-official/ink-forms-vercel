export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const targetUrl = "https://goofball-marital-lying.ngrok-free.dev" + url.pathname + url.search;

  const headers = new Headers(request.headers);
  headers.set("ngrok-skip-browser-warning", "true");

  const init = {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual",
  };

  return fetch(targetUrl, init);
}
