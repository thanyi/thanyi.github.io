(function () {
  // Heading anchors are added client-side so the static article text stays
  // identical to the recovered source (the migration verifier hashes it).
  function addHeadingLinks() {
    var article = document.getElementById("article");
    if (!article) return;
    article.querySelectorAll("h2, h3, h4, h5, h6").forEach(function (heading) {
      if (!heading.id || heading.querySelector(".heading-link")) return;
      heading.classList.add("group");
      var link = document.createElement("a");
      link.className = "heading-link";
      link.href = "#" + heading.id;
      link.setAttribute("aria-label", "链接到本节");
      link.textContent = "#";
      heading.appendChild(link);
    });
  }

  function setupProgress() {
    var article = document.getElementById("article");
    if (!article) return;
    var bar = document.createElement("div");
    bar.id = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    function update() {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      bar.style.width = progress * 100 + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function init() {
    addHeadingLinks();
    setupProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
