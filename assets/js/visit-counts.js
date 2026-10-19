(function () {
  var metrics = ["site_pv", "site_uv", "page_pv"];
  var productionHostname = "thanyi.github.io";
  var cancelRequest;

  function finishLoading(message) {
    document.querySelectorAll("[data-visit-count]").forEach(function (element) {
      element.setAttribute("aria-busy", "false");
      if (message) element.title = message;
    });
  }

  function isCounts(data) {
    return (
      data &&
      typeof data === "object" &&
      metrics.every(function (metric) {
        var value = data[metric];
        return (
          typeof value === "number" &&
          Number.isSafeInteger(value) &&
          value >= 0
        );
      })
    );
  }

  function refreshCounts() {
    if (cancelRequest) cancelRequest();

    // Local previews must not create shared statistics or pollute real counts.
    if (window.location.hostname !== productionHostname) {
      finishLoading("本地预览不计入统计，发布后显示实际数据");
      return;
    }

    var page = window.location.pathname;
    var suffix =
      window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID().replace(/-/g, "")
        : String(Date.now()) + Math.random().toString(16).slice(2);
    var callback = "BusuanziCallback_" + suffix;
    var script = document.createElement("script");
    var active = true;
    var timeout;

    function cleanup() {
      active = false;
      clearTimeout(timeout);
      script.remove();
      // A JSONP response can arrive after a timeout. Ignore it safely.
      window[callback] = function () {};
      setTimeout(function () {
        delete window[callback];
      }, 60000);
      cancelRequest = undefined;
    }

    function fail() {
      if (!active) return;
      if (window.location.pathname === page) finishLoading("统计暂时不可用");
      cleanup();
    }

    window[callback] = function (data) {
      if (!active) return;
      if (window.location.pathname === page) {
        if (isCounts(data)) {
          metrics.forEach(function (metric) {
            var value = document.getElementById("busuanzi_value_" + metric);
            if (value) value.textContent = data[metric].toLocaleString("zh-CN");
          });
          finishLoading();
        } else {
          finishLoading("统计暂时不可用");
        }
      }
      cleanup();
    };

    // Same endpoint and IDs as the original Butterfly integration.
    script.src =
      "https://busuanzi.ibruce.info/busuanzi?jsonpCallback=" + callback;
    script.async = true;
    script.referrerPolicy = "no-referrer-when-downgrade";
    script.onerror = fail;
    script.onload = function () {
      if (active) fail(); // A successful JSONP response must invoke its callback.
    };
    timeout = setTimeout(fail, 10000);
    cancelRequest = cleanup;
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refreshCounts);
  } else {
    refreshCounts();
  }
})();
