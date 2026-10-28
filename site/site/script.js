const categories=['Все проекты','Кухни','Гостиные','Прихожие','Мебель для санузла','Школы и офисы','Стеллажи','Кабинеты','Шкафы и гардеробные','Диваны','Пуфики','Кресла','Кровати'];
const filters=document.querySelector('#filters');
const cards=document.querySelector('#cards');
let selected='Все проекты';
function draw(){filters.innerHTML=categories.map(c=>`<button class="filter ${selected===c?'active':''}" data-category="${c}">${c}</button>`).join('');let list=projects.filter(p=>selected==='Все проекты'||p.category===selected);cards.innerHTML=list.map(p=>`<article class="card"><div class="card-visual"><span>${p.image?'Фотография проекта':'Добавьте фото проекта'}</span></div><div class="card-info"><b>${p.title}</b><span>${p.category}</span></div></article>`).join('')||'<p>В этой рубрике пока нет проектов. Напишите нам — покажем примеры работ.</p>';filters.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.category;draw()}))}
let projects=[];
fetch('data/projects.json').then(r=>r.json()).then(data=>{projects=data;draw()}).catch(()=>{projects=[];draw()});
const toggle=document.querySelector('.menu-toggle');
toggle.addEventListener('click',()=>{const open=document.querySelector('.nav').classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.nav').classList.remove('open')));
