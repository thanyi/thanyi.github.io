import config from "@/config";

const metrics = ["site_pv", "site_uv", "page_pv"] as const;
type Counts = Record<(typeof metrics)[number], number>;
type Callback = `BusuanziCallback_${string}`;

declare global {
  interface Window {
    [key: Callback]: ((data: unknown) => void) | undefined;
  }
}

let cancelRequest: (() => void) | undefined;
const productionHostname = new URL(config.site.url).hostname;

function finishLoading(message?: string) {
  document
    .querySelectorAll<HTMLElement>("[data-visit-count]")
    .forEach(element => {
      element.setAttribute("aria-busy", "false");
      if (message) element.title = message;
    });
}

function isCounts(data: unknown): data is Counts {
  return (
    typeof data === "object" &&
    data !== null &&
    metrics.every(metric => {
      const value = (data as Record<string, unknown>)[metric];
      return (
        typeof value === "number" && Number.isSafeInteger(value) && value >= 0
      );
    })
  );
}

function refreshCounts() {
  cancelRequest?.();

  // Local previews must not create shared localhost statistics or pollute real counts.
  if (window.location.hostname !== productionHostname) {
    finishLoading("本地预览不计入统计，发布后显示实际数据");
    return;
  }

  const page = window.location.pathname;
  const callback: Callback = `BusuanziCallback_${crypto.randomUUID().replaceAll("-", "")}`;
  const script = document.createElement("script");
  let active = true;

  function cleanup() {
    active = false;
    clearTimeout(timeout);
    script.remove();
    // A JSONP response can arrive after a navigation or timeout. Ignore it safely.
    window[callback] = () => {};
    setTimeout(() => delete window[callback], 60_000);
    cancelRequest = undefined;
  }

  function fail() {
    if (!active) return;
    if (window.location.pathname === page) finishLoading("统计暂时不可用");
    cleanup();
  }

  window[callback] = data => {
    if (!active) return;
    if (window.location.pathname === page) {
      if (isCounts(data)) {
        for (const metric of metrics) {
          const value = document.getElementById(`busuanzi_value_${metric}`);
          if (value) value.textContent = data[metric].toLocaleString("zh-CN");
        }
        finishLoading();
      } else {
        finishLoading("统计暂时不可用");
      }
    }
    cleanup();
  };

  // Same endpoint and IDs as the original Butterfly integration. Set the policy
  // on this request so Busuanzi receives the article path, not just the origin.
  script.src = `https://busuanzi.ibruce.info/busuanzi?jsonpCallback=${callback}`;
  script.async = true;
  script.referrerPolicy = "no-referrer-when-downgrade";
  script.onerror = fail;
  script.onload = () => {
    if (active) fail(); // A successful JSONP response must invoke its callback.
  };
  const timeout = setTimeout(fail, 10_000);
  cancelRequest = cleanup;
  document.head.appendChild(script);
}

// ClientRouter emits page-load once on the first page and after every page swap.
document.addEventListener("astro:page-load", refreshCounts);
document.addEventListener("astro:before-swap", () => cancelRequest?.());
