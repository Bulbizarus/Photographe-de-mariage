const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#mobile-nav');
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menu.hidden=!open;});
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');}});
// Le défilement natif suit le trackpad et le toucher, sans bloquer la page.
const heroTrack=document.querySelector('.hero-track');
const heroSlides=Array.from(heroTrack.querySelectorAll('img'));
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let heroIndex=0;
function updateHeroIndex(){
  const position=heroTrack.scrollLeft;
  const maxScroll=heroTrack.scrollWidth-heroTrack.clientWidth;
  heroIndex=position>=maxScroll-2 && maxScroll>0 ? heroSlides.length-1 : heroSlides.reduce((nearest,img,i)=>Math.abs(img.offsetLeft-position)<Math.abs(heroSlides[nearest].offsetLeft-position)?i:nearest,0);
}
function changeHero(step){
  const maxScroll=heroTrack.scrollWidth-heroTrack.clientWidth;
  const stops=[...new Set(heroSlides.map(img=>Math.min(img.offsetLeft,maxScroll)))];
  const position=heroTrack.scrollLeft;
  const next=step>0 ? (stops.find(x=>x>position+2) ?? 0) : (stops.slice().reverse().find(x=>x<position-2) ?? maxScroll);
  heroTrack.scrollTo({left:next,behavior:reducedMotion.matches?'instant':'smooth'});
}
heroTrack.addEventListener('scroll',updateHeroIndex,{passive:true});
heroTrack.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
    e.preventDefault();changeHero(e.key==='ArrowRight'?1:-1);
  }
});
document.querySelector('.hero-prev').addEventListener('click',()=>changeHero(-1));
document.querySelector('.hero-next').addEventListener('click',()=>changeHero(1));
window.addEventListener('resize',()=>heroTrack.scrollTo({left:heroSlides[heroIndex].offsetLeft,behavior:'instant'}));
const photos=Array.from(document.querySelectorAll('[data-photo]'));
const dialog=document.querySelector('#lightbox');let current=0,lastFocus;
let activePhotos=photos.map(button=>button.querySelector('img'));
function openPhoto(collection,index,trigger){
  activePhotos=collection;lastFocus=trigger;showPhoto(index);
  dialog.showModal();document.body.classList.add('modal-open');
}
function showPhoto(index){current=(index+activePhotos.length)%activePhotos.length;const source=activePhotos[current];const img=dialog.querySelector('img');img.src=source.src;img.alt=source.alt;dialog.querySelector('figcaption').textContent=(current+1)+' / '+activePhotos.length;}
photos.forEach((button,index)=>button.addEventListener('click',()=>openPhoto(photos.map(item=>item.querySelector('img')),index,button)));
// Les images restent dans le défilement natif et deviennent accessibles au clavier.
heroSlides.forEach((photo,index)=>{
  photo.tabIndex=0;
  photo.setAttribute('role','button');
  photo.setAttribute('aria-label','Agrandir : '+photo.alt);
  photo.setAttribute('aria-haspopup','dialog');
  let gesture;
  photo.addEventListener('pointerdown',event=>{
    gesture={x:event.clientX,y:event.clientY,scroll:heroTrack.scrollLeft,moved:false};
  });
  photo.addEventListener('pointermove',event=>{
    if(gesture && Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>10)gesture.moved=true;
  });
  photo.addEventListener('pointercancel',()=>{if(gesture)gesture.moved=true;});
  photo.addEventListener('click',event=>{
    const dragged=gesture && (gesture.moved || Math.abs(heroTrack.scrollLeft-gesture.scroll)>10);
    gesture=null;
    if(event.detail!==0 && dragged)return;
    openPhoto(heroSlides,index,photo);
  });
  photo.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){
      event.preventDefault();openPhoto(heroSlides,index,photo);
    }
  });
});
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());dialog.querySelector('.previous').addEventListener('click',()=>showPhoto(current-1));dialog.querySelector('.next').addEventListener('click',()=>showPhoto(current+1));
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');lastFocus?.focus();});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showPhoto(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(current-1);}});
let touchX;dialog.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].clientX;},{passive:true});dialog.addEventListener('touchend',e=>{const delta=e.changedTouches[0].clientX-touchX;if(Math.abs(delta)>60)showPhoto(current+(delta<0?1:-1));},{passive:true});
document.querySelector('#year').textContent=new Date().getFullYear();

const reviewTrack=document.querySelector('#review-track');
const reviewPrev=document.querySelector('.review-prev');
const reviewNext=document.querySelector('.review-next');
function updateReviewControls(){
  reviewPrev.disabled=reviewTrack.scrollLeft<=2;
  reviewNext.disabled=reviewTrack.scrollLeft>=reviewTrack.scrollWidth-reviewTrack.clientWidth-2;
}
function changeReview(direction){
  const card=reviewTrack.querySelector('article');
  const step=card.getBoundingClientRect().width+parseFloat(getComputedStyle(reviewTrack).gap);
  reviewTrack.scrollBy({left:direction*step,behavior:reducedMotion.matches?'instant':'smooth'});
}
reviewPrev.addEventListener('click',()=>changeReview(-1));
reviewNext.addEventListener('click',()=>changeReview(1));
reviewTrack.addEventListener('scroll',updateReviewControls,{passive:true});
reviewTrack.addEventListener('keydown',event=>{
  if(event.target!==reviewTrack)return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    event.preventDefault();changeReview(event.key==='ArrowRight'?1:-1);
  }
});
window.addEventListener('resize',updateReviewControls);
updateReviewControls();
