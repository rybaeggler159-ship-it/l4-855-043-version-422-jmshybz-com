
(function(){
  var menu=document.querySelector('[data-mobile-toggle]');
  var panel=document.querySelector('[data-mobile-panel]');
  if(menu&&panel){menu.addEventListener('click',function(){panel.classList.toggle('is-open')})}
  document.querySelectorAll('[data-search-form]').forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var input=form.querySelector('input');
      var q=input?input.value.trim():'';
      location.href='search.html'+(q?'?q='+encodeURIComponent(q):'');
    });
  });
  var filter=document.querySelector('[data-filter-input]');
  if(filter){
    var cards=[].slice.call(document.querySelectorAll('[data-card]'));
    var empty=document.querySelector('[data-empty]');
    var apply=function(){
      var q=filter.value.trim().toLowerCase();
      var shown=0;
      cards.forEach(function(card){
        var hay=(card.getAttribute('data-title')+' '+card.getAttribute('data-tags')+' '+card.getAttribute('data-year')+' '+card.getAttribute('data-region')).toLowerCase();
        var ok=!q||hay.indexOf(q)>-1;
        card.classList.toggle('hidden-card',!ok);
        if(ok) shown++;
      });
      if(empty) empty.classList.toggle('is-visible',shown===0);
    };
    filter.addEventListener('input',apply);
    var p=new URLSearchParams(location.search);var q=p.get('q');
    if(q){filter.value=q;apply()} else {apply()}
  }
  var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
  if(slides.length){
    var dots=[].slice.call(document.querySelectorAll('.hero-dot'));
    var current=0;
    var show=function(i){
      current=(i+slides.length)%slides.length;
      slides.forEach(function(s,k){s.classList.toggle('is-active',k===current)});
      dots.forEach(function(d,k){d.classList.toggle('is-active',k===current)});
    };
    var next=document.querySelector('[data-hero-next]');
    var prev=document.querySelector('[data-hero-prev]');
    if(next) next.addEventListener('click',function(){show(current+1)});
    if(prev) prev.addEventListener('click',function(){show(current-1)});
    dots.forEach(function(d,k){d.addEventListener('click',function(){show(k)})});
    show(0);
    setInterval(function(){show(current+1)},5000);
  }
})();
function initPlayer(videoId, overlayId, src){
  var video=document.getElementById(videoId);
  var overlay=document.getElementById(overlayId);
  if(!video||!overlay||!src)return;
  var ready=false;
  var hls=null;
  function attach(){
    if(ready)return;
    if(video.canPlayType('application/vnd.apple.mpegurl')){
      video.src=src;
    }else if(window.Hls&&window.Hls.isSupported()){
      hls=new Hls({enableWorker:true,lowLatencyMode:true});
      hls.loadSource(src);
      hls.attachMedia(video);
    }else{
      video.src=src;
    }
    ready=true;
  }
  function play(){
    attach();
    overlay.classList.add('is-hidden');
    var p=video.play();
    if(p&&p.catch)p.catch(function(){overlay.classList.remove('is-hidden')});
  }
  overlay.addEventListener('click',play);
  video.addEventListener('click',function(){if(video.paused)play()});
}
