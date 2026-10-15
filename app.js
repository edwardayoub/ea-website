document.addEventListener("DOMContentLoaded", function () {

  // ── Mobile Navigation ──
  var hamburger = document.querySelector(".hamburger");
  var navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("open");
      var isOpen = navLinks.classList.contains("open");
      hamburger.setAttribute("aria-expanded", isOpen);
      hamburger.innerHTML = isOpen ? "&#10005;" : "&#9776;";
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        hamburger.innerHTML = "&#9776;";
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ── Navbar scroll effect ──
  var navbar = document.querySelector(".navbar");
  if (navbar) {
    var onScroll = function () {
      if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ── Active nav link ──
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  // ── Scroll Reveal ──
  var revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length > 0 && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  // ── Animated Counters ──
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length > 0 && "IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1500;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  // ── Publications per Year Chart ──
  var chart = document.getElementById("pub-chart");
  if (chart) {
    var status = document.getElementById("pub-filter-status");
    var items = Array.prototype.slice.call(
      document.querySelectorAll("#publications .pub-item")
    );
    var byYear = {};
    items.forEach(function (item) {
      var dateText = item.querySelector(".pub-date").textContent;
      var match = dateText.match(/\b(19|20)\d{2}\b/);
      if (!match) return;
      var year = match[0];
      var kind = /preprint/i.test(dateText) ? "preprint" : "journal";
      item.setAttribute("data-year", year);
      byYear[year] = byYear[year] || { journal: 0, preprint: 0 };
      byYear[year][kind]++;
    });

    var years = Object.keys(byYear).map(Number);
    var minYear = Math.min.apply(null, years);
    var maxYear = Math.max(Math.max.apply(null, years), new Date().getFullYear());
    var maxCount = 0;
    years.forEach(function (y) {
      maxCount = Math.max(maxCount, byYear[y].journal + byYear[y].preprint);
    });

    var selected = null;

    for (var y = minYear; y <= maxYear; y++) {
      var counts = byYear[y] || { journal: 0, preprint: 0 };
      var total = counts.journal + counts.preprint;
      var bar = document.createElement("button");
      bar.type = "button";
      bar.className = "pub-bar" + (total === 0 ? " empty" : "");
      bar.setAttribute("data-year", y);
      bar.setAttribute("aria-pressed", "false");
      bar.setAttribute("aria-label", y + ": " + total + " publication" + (total === 1 ? "" : "s"));
      bar.disabled = total === 0;
      bar.innerHTML =
        '<span class="pub-bar-count">' + (total || "") + '</span>' +
        '<span class="pub-bar-track">' +
          '<span class="pub-bar-fill" style="--h:' + (total / maxCount * 100) + '%">' +
            '<span class="seg seg-preprint" style="flex-grow:' + counts.preprint + '"></span>' +
            '<span class="seg seg-journal" style="flex-grow:' + counts.journal + '"></span>' +
          '</span>' +
        '</span>' +
        '<span class="pub-bar-year' + ((maxYear - y) % 2 ? ' alt' : '') + '">&rsquo;' + String(y).slice(2) + '</span>';
      bar.title = y + " — " + counts.journal + " journal, " + counts.preprint + " preprint";
      bar.addEventListener("click", onBarClick);
      chart.appendChild(bar);
    }

    function onBarClick(e) {
      var year = e.currentTarget.getAttribute("data-year");
      selected = selected === year ? null : year;
      applyFilter();
    }

    function applyFilter() {
      var shown = 0;
      items.forEach(function (item) {
        var match = !selected || item.getAttribute("data-year") === selected;
        item.classList.toggle("pub-hidden", !match);
        if (match) shown++;
      });
      chart.querySelectorAll(".pub-bar").forEach(function (bar) {
        var on = bar.getAttribute("data-year") === selected;
        bar.classList.toggle("selected", on);
        bar.classList.toggle("dimmed", !!selected && !on);
        bar.setAttribute("aria-pressed", on ? "true" : "false");
      });
      chart.classList.toggle("has-selection", !!selected);
      if (selected) {
        status.innerHTML = "Showing <strong>" + shown + "</strong> from " + selected +
          ' &middot; <button type="button" class="pub-clear">Show all</button>';
        status.querySelector(".pub-clear").addEventListener("click", function () {
          selected = null;
          applyFilter();
        });
      } else {
        status.innerHTML = "<strong>" + items.length + "</strong> publications &middot; click a year to filter";
      }
    }

    applyFilter();

    // Grow bars when the chart scrolls into view
    if ("IntersectionObserver" in window) {
      var chartObserver = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          chart.classList.add("grown");
          chartObserver.disconnect();
        }
      }, { threshold: 0.3 });
      chartObserver.observe(chart);
    } else {
      chart.classList.add("grown");
    }
  }

  // ── Footer Year ──
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear() + " Edward Ayoub";
  }
});
