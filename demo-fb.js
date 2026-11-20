/* DEMO engine: imitates the shared Firebase database inside this phone only (same rules as the real one) */
(function(){
const K="demo_db";const load=()=>{try{return JSON.parse(localStorage.getItem(K)||"{}")}catch(e){return{}}},save=d=>{try{localStorage.setItem(K,JSON.stringify(d))}catch(e){}};
let uid=localStorage.getItem("demo_uid");if(!uid){uid="u"+Math.random().toString(36).slice(2,10);localStorage.setItem("demo_uid",uid)}
(function seed(){const d=load();if(d.__seeded)return;const day=o=>{const x=new Date();x.setDate(x.getDate()+o);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
  const P={d1:{name:"Karobka 2 kg",kind:"karobka",blok:10,pachka:50,pachkaIn:"blok"},d2:{name:"Karobka 1 kg",kind:"karobka",blok:20,pachka:0,pachkaIn:"blok"},d3:{name:"Etiketka shokolad",kind:"etiketka",donaKg:16,v:2}};
  for(const id in P)d["products/"+id]={...P[id],id};
  const F={d1:{dona:1,blok:10,pachka:50},d2:{dona:1,blok:20},d3:{kg:1,dona:16}};let n=0;
  const T=[["d1","in",10,"pachka",-5,"Ali","Yetkazib beruvchi"],["d1","out",3,"pachka",-4,"Vali","1-smena"],["d1","out",25,"blok",-2,"Ali",""],["d1","in",10,"pachka",-1,"Rustam aka",""],["d1","out",4,"pachka",0,"Vali","2-smena"],["d1","out",5,"pachka",1,"Rustam aka","Reja"],
    ["d2","in",30,"blok",-3,"Ali",""],["d2","out",120,"dona",-1,"Vali",""],["d2","out",5,"blok",0,"Ali",""],["d3","in",160,"kg",-4,"Rustam aka","10 rulon"],["d3","out",3,"dona",-2,"Vali",""],["d3","out",40,"kg",0,"Ali",""]];
  for(const [pid,type,qty,unit,off,by,note] of T){const id="t"+(n++);d["tx/"+id]={id,pid,type,qty,unit,base:qty*F[pid][unit],date:day(off),by,note,at:Date.now()-(6-off)*3600e3-n*600e3}}
  d.__seeded=true;save(d)})();
const listeners=[];
function deny(){const e=new Error("Missing or insufficient permissions");e.code="permission-denied";return e}
function ok(path,data,op){const d=load(),acc=d["config/access"],mem=d["members/"+uid];const member=acc&&mem&&mem.code===acc.code;
  if(path==="config/public")return op==="read"||!d[path];
  if(path==="config/access"){if(op==="read")return false;if(!acc)return true;return data.adminCode===acc.adminCode}
  if(path.startsWith("members/"))return path==="members/"+uid&&!!acc&&data.code===acc.code;
  return member}
const notify=()=>listeners.forEach(l=>l());
const snap=v=>({exists:()=>!!v,data:()=>v});
window.FB={initializeApp:()=>({}),getAuth:()=>({currentUser:{uid}}),onAuthStateChanged:(a,cb)=>{setTimeout(()=>cb({uid}),10);return()=>{}},signInAnonymously:async()=>({user:{uid}}),
 initializeFirestore:()=>({}),persistentLocalCache:()=>({}),persistentSingleTabManager:()=>({}),memoryLocalCache:()=>({}),
 doc:(db,c,id)=>({path:c+"/"+id}),collection:(db,c)=>({col:c}),serverTimestamp:()=>Date.now(),
 getDoc:async r=>snap(load()[r.path]),getDocFromServer:async r=>snap(load()[r.path]),
 setDoc:async(r,data)=>{await new Promise(z=>setTimeout(z,120));if(!ok(r.path,data,"write"))throw deny();const d=load();d[r.path]=JSON.parse(JSON.stringify(data));save(d);notify()},
 deleteDoc:async r=>{if(!ok(r.path,{},"write"))throw deny();const d=load();delete d[r.path];save(d);notify()},
 onSnapshot:(q,opts,next,err)=>{const fire=()=>{if(!ok(q.col+"/x",{},"read")){err&&err(deny());return}const d=load();next({docs:Object.keys(d).filter(k=>k.startsWith(q.col+"/")).map(k=>({id:k.slice(q.col.length+1),data:()=>d[k]})),metadata:{fromCache:false}})};
  listeners.push(fire);setTimeout(fire,30);return()=>{const i=listeners.indexOf(fire);if(i>=0)listeners.splice(i,1)}},
 updateDoc:async()=>{},writeBatch:()=>({})};
})();
