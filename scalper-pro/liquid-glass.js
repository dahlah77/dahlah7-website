/* DAHLAH7 Liquid Glass: accessible nav, expanding dock & liquid menu. */
(function(){
  'use strict';
  const $=(s,ctx=document)=>ctx.querySelector(s);
  const $$=(s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const overlay=$('#liquidMenuOverlay');
  const trigger=$('#liquidMenuBtn');
  const close=$('#liquidMenuClose');
  const panel=$('.liquid-menu-panel');
  const dock=$('#liquidDock');
  const dockToggle=$('#dockToggle');
  const header=$('header nav.wrap');
  if(!overlay||!trigger||!close||!dock||!dockToggle||!header)return;
  let previousFocus=null;
  function isOpen(){return !overlay.hidden}
  function menuOpen(){
    if(isOpen())return;
    previousFocus=document.activeElement;
    overlay.hidden=false;
    document.body.style.overflow='hidden';
    trigger.setAttribute('aria-expanded','true');
    close.focus();
  }
  function menuClose(){
    if(!isOpen())return;
    overlay.hidden=true;
    trigger.setAttribute('aria-expanded','false');
    if(!$('#orderModal')||$('#orderModal').hidden)document.body.style.overflow='';
    if(previousFocus&&previousFocus.isConnected&&previousFocus.focus)previousFocus.focus();
  }
  trigger.addEventListener('click',menuOpen);
  close.addEventListener('click',menuClose);
  overlay.addEventListener('pointerdown',(e)=>{if(e.target===overlay)menuClose()});
  $$('.liquid-menu-list a').forEach(a=>a.addEventListener('click',menuClose));
  const menuOrder=$('#liquidMenuOrder');
  if(menuOrder){
    menuOrder.addEventListener('click',()=>{
      menuClose();
      const button=$('.hero [data-order]');
      if(button)button.click();
    });
  }
  document.addEventListener('keydown',(e)=>{
    if(!isOpen())return;
    if(e.key==='Escape'){e.preventDefault();menuClose();return}
    if(e.key==='Tab'){
      const f=$$('a,button,input,[tabindex]:not([tabindex="-1"])',panel).filter(el=>!el.hasAttribute('disabled')&&el.getClientRects().length>0);
      if(!f.length)return;
      if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus()}
      else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus()}
    }
  });
  dockToggle.addEventListener('click',()=>{
    const expanded=dock.classList.toggle('expanded');
    dockToggle.setAttribute('aria-expanded',String(expanded));
    dockToggle.setAttribute('aria-label',expanded?'Ciutkan sidebar':'Perluas sidebar');
    dockToggle.textContent='❯';
  });
  $$('.dock-link').forEach(a=>a.addEventListener('click',()=>{
    if(dock.classList.contains('expanded')){
      dock.classList.remove('expanded');
      dockToggle.setAttribute('aria-expanded','false');
    }
  }));
  const targets=['fitur','demo','alur','harga','faq'];
  function updateActive(current){
    $$('.links a, .dock-link, .liquid-menu-list a').forEach(a=>{
      const match=a.getAttribute('href')==='#'+current;
      a.classList.toggle('liquid-active',match);
      a.classList.toggle('dock-selected',match);
      a.classList.toggle('is-current',match);
      if(match)a.setAttribute('aria-current','location');
      else a.removeAttribute('aria-current');
    });
  }
  function visibleSection(){
    let current='top';
    targets.forEach(id=>{
      const el=document.getElementById(id);
      if(el&&el.getBoundingClientRect().top < window.innerHeight*.43) current=id;
    });
    updateActive(current);
  }
  let ticking=false;
  window.addEventListener('scroll',()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(()=>{visibleSection();ticking=false;});
  },{passive:true});
  visibleSection();
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    header.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch')return;
      const b=header.getBoundingClientRect();
      header.style.setProperty('--pointer-x',(((e.clientX-b.left)/b.width)*100)+'%');
      header.style.setProperty('--pointer-y',(((e.clientY-b.top)/b.height)*100)+'%');
    },{passive:true});
  }
})();