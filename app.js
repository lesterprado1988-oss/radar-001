const VERSION='0.9', KEY='radar_memory_v09', REM='radar_reminders_v09';
const $=id=>document.getElementById(id);
let data=load(KEY), reminders=load(REM);
function load(k){try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
const dayNames=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
function dateFromText(t){const x=norm(t),now=new Date();let d=null;
 if(/\bpasado manana\b/.test(x)){d=new Date(now);d.setDate(d.getDate()+2)}
 else if(/\bmanana\b/.test(x)){d=new Date(now);d.setDate(d.getDate()+1)}
 else {const m=x.match(/\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/);if(m){const target=dayNames.indexOf(m[1]),cur=now.getDay(),add=(target-cur+7)%7;d=new Date(now);d.setDate(d.getDate()+(add===0?7:add))}}
 return d;
}
function timeFromText(t){const x=norm(t);let m=x.match(/(?:a las|alas|a la)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);if(!m)m=x.match(/\b(\d{1,2})(?::(\d{2}))\s*(am|pm)\b/);
 if(m){let h=+m[1],min=+(m[2]||0);if(m[3]==='pm'&&h<12)h+=12;if(m[3]==='am'&&h===12)h=0;return{h,min}}
 m=x.match(/dentro\s+de\s+(\d+)\s+(segundos?|minutos?|horas?)/);if(m){let n=+m[1],unit=m[2];return{relative:unit.startsWith('seg')?n/60:unit.startsWith('hora')?n*60:n}}
 if(/\ben una hora\b/.test(x))return{relative:60};
 return null;
}
function emotionType(x){if(/\b(triste|tristeza|deprimid)/.test(x))return'tristeza';if(/\b(emocionado|emocionada|emocion|entusiasm)/.test(x))return'emocion';if(/\b(feliz|contento|contenta|alegre)/.test(x))return'alegria';if(/\b(enojado|enojada|molesto|molesta|enojo)/.test(x))return'enojo';if(/\b(estres|estresado|estresada|agobiado|agobiada)/.test(x))return'estres';if(/\b(preocupado|preocupada|preocupacion|miedo|temor)/.test(x))return'preocupacion';return null}
function analyze(text){const x=norm(text), intents=[],signals=[];const add=(i,s)=>{if(!intents.includes(i))intents.push(i);if(s&&!signals.includes(s))signals.push(s)};
 const explicit=/\b(recu[eé]rdame|no quiero olvidar|no olvidarme|debo recordar|quiero recordar|tengo que recordar)\b/i.test(text);
 if(explicit)add('recordatorio','recordatorio');
 if(/\b(tengo que|tengo q|debo|hay que|me toca|toca)\b/.test(x))add('compromiso','compromiso');
 if(/\b(quiero|quisiera|me gustaria|estoy pensando|estoy considerando|si pudiera|tal vez)\b/.test(x))add('intención','intencion');
 if(/\b(necesito|necesito saber)\b/.test(x))add('necesidad','necesidad');
 if(/\b(como puedo|como hago|no se como|ayudame)\b/.test(x))add('pregunta','pregunta');
 const emotion=emotionType(x);if(emotion)add('estado emocional','emocion');
 if(/\b(ya hice|logre|termine|consegui|salio bien|funciono|lo logre)\b/.test(x))add('logro/acción realizada','logro');
 if(/\b(me preocupa|me da miedo|tengo miedo|me estresa|estres|me preocupa)\b/.test(x))add('preocupación','preocupacion');
 const possibleExpense=/\b(comprar|pagar|gastar|cuesta|presupuesto|quetzales?|dinero|q\s*\d+)\b/i.test(text);if(possibleExpense)add('posible gasto','gasto');
 const date=dateFromText(text),time=timeFromText(text), hasWhen=!!(date||time), shouldRemind=(explicit||intents.includes('compromiso'))&&hasWhen;
 let reminder=null;if(shouldRemind){let when=new Date();if(time?.relative)when.setMinutes(when.getMinutes()+time.relative);else{if(date)when.setFullYear(date.getFullYear(),date.getMonth(),date.getDate());if(time)when.setHours(time.h,time.min,0,0);else when.setHours(9,0,0,0);if(when<=new Date()&&!date)when.setDate(when.getDate()+1)}reminder={id:crypto.randomUUID(),when:when.toISOString(),text:text,created:new Date().toISOString(),done:false}};
 return{intents,signals,date,time,reminder,possibleExpense,emotion};
}
function responseFor(a,e){if(a.emotion==='emocion')return'🌟 Excelente. Hay entusiasmo en lo que estás viviendo. Pon atención a qué lo provocó; puede señalar algo que realmente te importa.';if(a.emotion==='alegria')return'😊 Qué bueno. Vale la pena reconocer este momento y observar qué lo hizo posible.';if(a.emotion==='tristeza')return'💙 Te escucho. Voy a tenerlo en cuenta. Si este estado aparece repetidamente, RADAR podrá detectar el patrón y buscar contigo qué podría ayudarte.';if(a.emotion==='estres')return'🧭 Parece que estás cargando con bastante presión. Vale la pena poner atención a qué situación la está provocando.';if(a.emotion==='preocupacion')return'💡 Esta preocupación parece importante. Voy a observar si vuelve a aparecer y con qué situaciones se relaciona.';if(a.intents.includes('logro/acción realizada'))return'🎉 Bien hecho. Registrar lo que sí lograste ayuda a RADAR a entender tus avances, no solamente tus pendientes.';if(a.intents.includes('intención'))return'🎯 He registrado esa intención. Si vuelve a aparecer, RADAR podrá relacionarla con lo que hagas después.';return'🧠 Lo guardaré como parte de tu contexto y observaré si se relaciona con otras cosas que me cuentes.'}
function fmtDate(iso){return new Date(iso).toLocaleString('es-GT',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})}
function renderResult(e,a){let html='<div class="result"><strong>🧠 Detecté:</strong> '+(a.intents.length?a.intents.join(' · '):'información para tu contexto');if(a.emotion)html+='<div class="response">'+responseFor(a,e)+'</div>';else html+='<div class="response">'+responseFor(a,e)+'</div>';
 if(a.reminder){html+='<div class="signal">📅 '+fmtDate(a.reminder.when)+'</div><div class="signal">✓ Recordatorio programado</div>'}
 if(a.time?.relative&&!a.reminder)html+='<div class="signal">⏰ En '+a.time.relative+' minutos</div>';if(a.possibleExpense)html+='<div class="signal">💰 Posible gasto detectado</div>';html+='<div class="why">RADAR guardó esta entrada en tu memoria local.</div><div class="feedback"><button onclick="feedback(\''+e.id+'\',\'Superútil\')">Superútil</button><button onclick="feedback(\''+e.id+'\',\'Bastante útil\')">Bastante útil</button><button onclick="feedback(\''+e.id+'\',\'Regular\')">Regular</button><button onclick="feedback(\''+e.id+'\',\'Poco útil\')">Poco útil</button><button onclick="feedback(\''+e.id+'\',\'Nada útil\')">Nada útil</button></div></div>';$('result').innerHTML=html}
window.feedback=(id,v)=>{const e=data.find(x=>x.id===id);if(e){e.feedback=v;save(KEY,data);$('result').insertAdjacentHTML('beforeend','<div class="muted small">Feedback guardado: '+v+'</div>')}};
function schedule(r){reminders.push(r);save(REM,reminders);const ms=new Date(r.when)-Date.now();if(ms>0&&ms<2147483647)setTimeout(()=>notify(r),ms)}
async function notify(r){if(r.done)return;const e=reminders.find(x=>x.id===r.id);if(e)e.done=true;save(REM,reminders);if('Notification'in window){if(Notification.permission==='granted')new Notification('RADAR · Recordatorio',{body:r.text});else if(Notification.permission!=='denied')try{const p=await Notification.requestPermission();if(p==='granted')new Notification('RADAR · Recordatorio',{body:r.text})}catch{}}else alert('RADAR · Recordatorio\n'+r.text)}
async function enableNotifications(){if('Notification'in window&&Notification.permission==='default')try{await Notification.requestPermission()}catch{}}
function restoreTimers(){const now=Date.now();reminders.filter(r=>!r.done).forEach(r=>{const ms=new Date(r.when)-now;if(ms>0&&ms<2147483647)setTimeout(()=>notify(r),ms);else if(ms<=0)notify(r)})}
$('detect').onclick=async()=>{const text=$('input').value.trim();if(!text)return;await enableNotifications();const a=analyze(text),e={id:crypto.randomUUID(),text,time:new Date().toISOString(),analysis:{...a,date:a.date?.toISOString()||null},feedback:null};data.push(e);save(KEY,data);if(a.reminder)schedule(a.reminder);renderResult(e,a);$('input').value=''};
$('memoryBtn').onclick=()=>{const el=$('memory');el.classList.toggle('hidden');el.innerHTML='<h3>🧠 Memoria</h3>'+data.slice().reverse().map(e=>'<div class="item"><small>'+new Date(e.time).toLocaleString('es-GT')+'</small><br>'+escapeHtml(e.text)+'<br><span class="muted small">'+(e.analysis.intents?.join(' · ')||'contexto')+'</span></div>').join('')||'<p class="muted empty">Aún no hay memoria.</p>'};
$('summaryBtn').onclick=()=>{const el=$('summary');el.classList.toggle('hidden');const since=new Date();since.setHours(0,0,0,0);const today=data.filter(e=>new Date(e.time)>=since),counts={};today.forEach(e=>(e.analysis.intents||[]).forEach(i=>counts[i]=(counts[i]||0)+1));const emotions=today.filter(e=>e.analysis.emotion).map(e=>e.analysis.emotion),rem=today.filter(e=>e.analysis.reminder);const repeated=Object.entries(counts).filter(([,v])=>v>=2).sort((a,b)=>b[1]-a[1]);let html='<h3>📋 Resumen de hoy</h3><p>RADAR registró <strong>'+today.length+'</strong> entradas.</p>';html+='<p>🧠 '+(Object.entries(counts).map(([k,v])=>'<span class="tag">'+k+': '+v+'</span>').join(' ')||'Todavía no hay suficientes señales.')+'</p>';if(emotions.length)html+='<p>❤️ Estados emocionales mencionados: <strong>'+emotions.join(', ')+'</strong>.</p>';if(rem.length)html+='<p>📅 Recordatorios detectados hoy: <strong>'+rem.length+'</strong>.</p>';if(repeated.length)html+='<div class="response">🔎 <strong>Señal:</strong> hoy se repitieron '+repeated.map(x=>x[0]+' ('+x[1]+' veces)').join(', ')+'. RADAR seguirá observando antes de convertirlo en un patrón.</div>';html+='<p class="muted small">El resumen se construye directamente con lo que RADAR memorizó hoy.</p>';el.innerHTML=html};
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
restoreTimers();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
