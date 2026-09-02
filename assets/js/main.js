(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Sticky nav shrink ---- */
  var nav = document.querySelector('.nav');
  function onScroll(){
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  function closeMenu(){
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
  }
  function openMenu(){
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded','true');
    document.body.classList.add('menu-open');
  }
  if (toggle){
    toggle.addEventListener('click', function(){
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });
  }
  document.querySelectorAll('.mobile-menu a').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.14 });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---- Tracks accordion ---- */
  document.querySelectorAll('.track-head').forEach(function(head){
    head.addEventListener('click', function(){
      var body = document.getElementById(head.getAttribute('aria-controls'));
      var isOpen = head.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.track-head').forEach(function(h){
        h.setAttribute('aria-expanded','false');
        var b = document.getElementById(h.getAttribute('aria-controls'));
        if (b) b.style.maxHeight = null;
      });
      if (!isOpen){
        head.setAttribute('aria-expanded','true');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---- Reviewers expand ---- */
  var reviewerToggle = document.querySelector('.reviewer-toggle');
  var reviewerWrap = document.querySelector('.reviewer-wrap');
  if (reviewerToggle){
    reviewerToggle.addEventListener('click', function(){
      var expanded = reviewerWrap.classList.toggle('expanded');
      reviewerToggle.textContent = expanded ? 'Show fewer reviewers' : 'View all reviewers';
    });
  }

  /* ---- Gallery lightbox ---- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
  var lightbox = document.querySelector('.lightbox');
  var lightboxImg = document.querySelector('.lightbox img');
  var lightboxCaption = document.querySelector('.lightbox-caption');
  var currentIndex = 0;

  function showImage(i){
    currentIndex = (i + galleryItems.length) % galleryItems.length;
    var img = galleryItems[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt || '';
  }
  function openLightbox(i){
    showImage(i);
    lightbox.classList.add('open');
    document.body.classList.add('menu-open');
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
  galleryItems.forEach(function(item, i){
    item.addEventListener('click', function(){ openLightbox(i); });
  });
  var closeBtn = document.querySelector('.lightbox-close');
  var prevBtn = document.querySelector('.lightbox-prev');
  var nextBtn = document.querySelector('.lightbox-next');
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', function(){ showImage(currentIndex - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function(){ showImage(currentIndex + 1); });
  if (lightbox){
    lightbox.addEventListener('click', function(e){ if (e.target === lightbox) closeLightbox(); });
  }
  document.addEventListener('keydown', function(e){
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
  });

  /* ---- Custom cursor (desktop only) ---- */
  if (window.matchMedia('(hover:hover)').matches && window.innerWidth > 960){
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    window.addEventListener('mousemove', function(e){
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('a, button').forEach(function(el){
      el.addEventListener('mouseenter', function(){ dot.classList.add('hover'); });
      el.addEventListener('mouseleave', function(){ dot.classList.remove('hover'); });
    });
  }

  /* ---- Snapshot counter animation ---- */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window){
    var counterIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          animateCount(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold:0.5 });
    counters.forEach(function(c){ counterIO.observe(c); });
  }
  function animateCount(el){
    var target = el.getAttribute('data-count');
    var numeric = parseInt(target.replace(/[^0-9]/g,''), 10);
    if (isNaN(numeric) || reduceMotion){ el.textContent = target; return; }
    var suffix = target.replace(/[0-9]/g,'');
    var start = 0;
    var duration = 900;
    var startTime = null;
    function step(ts){
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      el.textContent = Math.floor(progress * numeric) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
})();
