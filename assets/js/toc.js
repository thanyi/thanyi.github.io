(function () {
  var sidebar = document.querySelector(".toc-sidebar");
  if (!sidebar) return;

  var entries = [];
  sidebar.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var id = decodeURIComponent(link.getAttribute("href").slice(1));
    var heading = document.getElementById(id);
    if (heading) entries.push({ heading: heading, link: link });
  });
  if (!entries.length) return;

  var active;
  var ticking = false;

  function update() {
    ticking = false;
    var offset = 120;
    var current = entries[0];
    for (var index = 0; index < entries.length; index++) {
      if (entries[index].heading.getBoundingClientRect().top <= offset) {
        current = entries[index];
      } else {
        break;
      }
    }
    if (current && current !== active) {
      if (active) active.link.classList.remove("active");
      active = current;
      current.link.classList.add("active");
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
