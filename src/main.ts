import './style.css'
import './gallery.css'
import {createBook} from './book'

type Room = { id:string; title:string; subtitle:string; cover:string; photos:string[]; date:string }
const dates = ['2025.10.01','2026.03.28','2026.05.03','2026.06.27','2026.07.29']
const rooms:Room[] = [
{id:'coffee-book',title:'Coffee & Book',subtitle:'一段关于安静、阅读与午后光线的记录',cover:'/optimized/1-coffee-book-cover.webp',photos:[],date:dates[0]},
{id:'city',title:'城市漫游指南',subtitle:'沿着街角、橱窗和晚风行走',cover:'/optimized/2--cover.webp',photos:[],date:dates[1]},
{id:'bride',title:'落跑新娘',subtitle:'一场没有按剧本发生的婚礼',cover:'/optimized/3--cover.webp',photos:[],date:dates[2]},
{id:'butterfly',title:'黄晶眼蝶',subtitle:'在野地里寻找轻盈的翅膀',cover:'/optimized/4--cover.webp',photos:[],date:dates[3]},
{id:'her',title:'美丽的她',subtitle:'关于凝视、距离与被看见',cover:'/optimized/5--cover.webp',photos:[],date:dates[4]}]
const files:Record<string,string[]>={'coffee-book':['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.jpg','10.jpg','11.jpg','12.jpg','13.jpg','14.jpg','15.jpg'],'city':['1.jpg','2.jpg','3.png','4.jpg','5.png','6.png','7.png','8.png','9.png','10.jpg','11.jpg','12.jpg','13.jpg','14.jpg','15.jpg','16.jpg','17.jpg','18.jpg','19.jpg','20.jpg','21.png','22.png','23.png','24.png','25.png','26.png','27.jpg','28.png'],'bride':Array.from({length:34},(_,i)=>`${i+1}.jpg`),'butterfly':Array.from({length:30},(_,i)=>`${i+1}.jpg`),'her':['1.jpg','2.jpg','3.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.JPG','10.jpg','11.jpg','12.jpg','13.jpg','14.JPG','15.jpg','16.jpg','17.jpg','18.jpg','19.jpg','20.jpg','21.jpg','22.jpg','23.jpg','24.JPG','25.JPG','26.jpg','27.jpg','28.jpg','29.jpg','30.jpg','31.jpg','32.jpg','33.jpg','34.jpg','35.jpg','36.jpg','37.jpg','38.jpg','39.JPG']}
rooms.forEach(r=>{r.cover=import.meta.env.BASE_URL+r.cover.slice(1);r.photos=files[r.id].map(f=>`${import.meta.env.BASE_URL}optimized/${r.id}/${f}`)})
const imageCache=new Map<string,Promise<void>>();
function preload(src:string){if(!imageCache.has(src)){imageCache.set(src,new Promise(resolve=>{const img=new Image();img.decoding='async';img.onload=()=>{if(img.decode)img.decode().catch(()=>{}).finally(resolve);else resolve()};img.onerror=()=>resolve();img.src=src}))}return imageCache.get(src)!}
// Cover requests start first; gallery neighbours are loaded when a theme opens.
const app=document.querySelector<HTMLDivElement>('#app')!
app.innerHTML=`<div class="grain"></div><header><div class="mark">M / 05</div><div class="hint">五次拍摄 · 五段记忆</div><button class="about">关于</button></header><main><section class="rooms"><div class="section-label">SELECT A ROOM <span>01 — 05</span></div><div class="room-grid"></div><div class="room-controls"><button class="room-prev" aria-label="上一个主题">←</button><span class="room-progress">01 / 05</span><button class="room-next" aria-label="下一个主题">→</button></div></section></main><footer><span>© 2026 MY PHOTO ROOMS</span><span>BUILT WITH MEMORY & LIGHT</span></footer><div class="modal" aria-hidden="true"><button class="close" aria-label="关闭作品展示">CLOSE ×</button><div class="modal-head"><div class="modal-index"></div><h2 class="modal-title"></h2><p class="modal-sub"></p></div><div class="book-stage"><button class="book-nav prev" aria-label="上一张">←</button><div class="photo-wall" tabindex="0" role="region" aria-label="横向照片展示"></div><button class="book-nav next" aria-label="下一张">→</button></div><div class="page-count"></div></div>`
const welcome=document.createElement('section');welcome.className='welcome';welcome.innerHTML=`<div class="archive">ARCHIVE / 001 · 2026</div><div class="welcome-copy"><span>Hello, I’m</span><strong>Fiona</strong><i>photographer’s notes ↗</i></div><div class="camera" role="img" aria-label="复古胶片相机"><div class="lens"><b></b></div><div class="shutter">PRESS SHUTTER</div></div><button class="welcome-enter">START EXPLORING ↗</button>`;document.body.append(welcome);const shutter=welcome.querySelector<HTMLButtonElement>('.welcome-enter')!,camera=welcome.querySelector<HTMLElement>('.camera')!;let camDrag=false,camX=0,camY=0
window.addEventListener('pointermove',e=>{if(welcome.classList.contains('leaving'))return;const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);if(!camDrag){camera.style.setProperty('--px',`${x*10}deg`);camera.style.setProperty('--py',`${y*8}deg`)}})
camera.addEventListener('pointerdown',e=>{camDrag=true;camera.setPointerCapture(e.pointerId);camera.classList.add('is-dragging')});camera.addEventListener('pointermove',e=>{if(!camDrag)return;camX=Math.max(-18,Math.min(18,camX+(e.movementX||0)*.18));camY=Math.max(-12,Math.min(12,camY+(e.movementY||0)*.18));camera.style.setProperty('--drag-x',`${camX}deg`);camera.style.setProperty('--drag-y',`${camY}deg`)});camera.addEventListener('pointerup',()=>{camDrag=false;camera.classList.remove('is-dragging');camX=0;camY=0;camera.style.setProperty('--drag-x','0deg');camera.style.setProperty('--drag-y','0deg')})
shutter.addEventListener('click',()=>{shutter.classList.add('pressed');camera.classList.add('focus-shot');welcome.classList.add('exposing');setTimeout(()=>{welcome.classList.add('leaving');setTimeout(()=>welcome.remove(),700)},420)});const grid=document.querySelector<HTMLElement>('.room-grid')!;grid.className='book-host'
const modal=document.querySelector<HTMLElement>('.modal')!,wall=document.querySelector<HTMLElement>('.photo-wall')!,count=document.querySelector<HTMLElement>('.page-count')!,title=document.querySelector<HTMLElement>('.modal-title')!,sub=document.querySelector<HTMLElement>('.modal-sub')!,idx=document.querySelector<HTMLElement>('.modal-index')!
let activeRoom:Room|null=null,activePage=0,startX=0,dragging=false,renderToken=0
async function renderPage(){const room=activeRoom;if(!room)return;const page=activePage;const token=++renderToken;const p=room.photos[page];preload(p);if(room.photos[page+1])preload(room.photos[page+1]);if(room.photos[page-1])preload(room.photos[page-1]);await imageCache.get(p);if(token!==renderToken||activeRoom!==room||activePage!==page)return;wall.innerHTML=`<figure class="shot is-current"><img src="${p}" alt="${room.title} ${page+1}" decoding="async" loading="eager"><figcaption>${String(page+1).padStart(2,'0')} / ${room.title}</figcaption></figure>`;count.textContent=`${String(page+1).padStart(2,'0')} / ${String(room.photos.length).padStart(2,'0')}`}function openRoom(id:string){activeRoom=rooms.find(r=>r.id===id)||null;if(!activeRoom)return;activePage=0;title.textContent=activeRoom.title;sub.textContent=activeRoom.subtitle;idx.textContent=`ROOM ${String(rooms.indexOf(activeRoom)+1).padStart(2,'0')} · ${activeRoom.date}`;renderPage();modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('locked');wall.focus()}
function movePage(dir:number){if(!activeRoom)return;activePage=Math.max(0,Math.min(activeRoom.photos.length-1,activePage+dir));renderPage()}
createBook(grid,rooms,openRoom)
grid.addEventListener('click',e=>{const card=(e.target as HTMLElement).closest<HTMLElement>('.room');if(card)openRoom(card.dataset.room!)})
grid.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const card=(e.target as HTMLElement).closest<HTMLElement>('.room');if(card){e.preventDefault();openRoom(card.dataset.room!)}}})
document.querySelector('.prev')!.addEventListener('click',()=>movePage(-1));document.querySelector('.next')!.addEventListener('click',()=>movePage(1));document.querySelector('.close')!.addEventListener('click',()=>{modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('locked')})
wall.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;wall.setPointerCapture(e.pointerId);wall.style.setProperty('--drag-x','0px')})
wall.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-startX;wall.style.setProperty('--drag-x',`${dx}px`);wall.style.setProperty('--drag-rotate',`${Math.max(-2,Math.min(2,dx/80))}deg`)})
function endDrag(e:PointerEvent){if(!dragging)return;dragging=false;const dx=e.clientX-startX;wall.style.setProperty('--drag-x','0px');wall.style.setProperty('--drag-rotate','0deg');if(Math.abs(dx)>55)movePage(dx<0?1:-1)}
wall.addEventListener('pointerup',endDrag);wall.addEventListener('pointercancel',endDrag)
window.addEventListener('keydown',e=>{if(modal.classList.contains('is-open')){if(e.key==='ArrowRight')movePage(1);if(e.key==='ArrowLeft')movePage(-1);if(e.key==='Home'&&activeRoom){activePage=0;renderPage()}if(e.key==='End'&&activeRoom){activePage=activeRoom.photos.length-1;renderPage()}if(e.key==='Escape')document.querySelector<HTMLButtonElement>('.close')!.click()}})




















