(()=>{
const $=i=>document.getElementById(i),T=window.THREE;
const fail=m=>{const l=$('load');l.style.display='flex';l.textContent=m};
if(!T){fail('Could not load Three.js. Check your internet connection and reload.');return}
addEventListener('error',e=>fail('Error: '+e.message));

// ---------- data ----------
const ST=[{n:'Central Station',s:150},{n:'Park Town',s:750},{n:'Government Estate',s:1350},{n:'Egmore',s:1950},{n:'Airport Terminal',s:2550}];
const END=2750,NC=3,CL=20;
const H=s=>s<810||s>1290?8:s<930?8*(930-s)/120:s<=1170?0:8*(s-1170)/120; // track height (tunnel 930-1170)
const slope=(s,w)=>Math.atan2(H(s+w)-H(s-w),2*w);
const rnd=(a,b)=>a+Math.random()*(b-a);

// ---------- renderer / scene ----------
const R=new T.WebGLRenderer({canvas:$('c'),antialias:true,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,1.5));R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
const sc=new T.Scene(),cam=new T.PerspectiveCamera(62,1,.1,1500);sc.add(cam);
const hemi=new T.HemisphereLight(0xffffff,0x445533,1),sun=new T.DirectionalLight(0xffffff,1);
sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
{const c=sun.shadow.camera;c.left=c.bottom=-70;c.right=c.top=70;c.near=1;c.far=220}
sc.add(hemi,sun,sun.target);
const rs=()=>{R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};
addEventListener('resize',rs);rs();

const M=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.1},o));
const B=(w,h,l,m,x,y,z,p)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,l),m);o.position.set(x,y,z);if(p)p.add(o);return o};
const D=new T.Object3D();
const put=(im,i,x,y,z,rz,sx,sy,sz)=>{D.position.set(x,y,z);D.rotation.set(0,0,rz||0);D.scale.set(sx||1,sy||1,sz||1);D.updateMatrix();im.setMatrixAt(i,D.matrix)};
const canv=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');fn(x,w,h);return[new T.CanvasTexture(c),x,c]};
const sign=(a,b)=>new T.MeshBasicMaterial({side:T.DoubleSide,map:canv(512,128,(x,w,h)=>{x.fillStyle='#0b4f9c';x.fillRect(0,0,w,h);x.fillStyle='#fff';x.textAlign='center';x.font='bold 52px sans-serif';x.fillText(a,w/2,66);x.fillStyle='#ffd23f';x.font='28px sans-serif';x.fillText(b,w/2,108)})[0]});

// ---------- ground, road, track ----------
const ground=new T.Mesh(new T.PlaneGeometry(3600,800),M(0x5f8050,{roughness:1}));
ground.rotation.x=-Math.PI/2;ground.position.set(1375,-.05,0);ground.receiveShadow=true;sc.add(ground);
const road=new T.Mesh(new T.PlaneGeometry(3600,9),M(0x2b2e33,{roughness:.9}));road.rotation.x=-Math.PI/2;road.position.set(1375,0,-22);sc.add(road);
const NS=END/2,sl=new T.InstancedMesh(new T.BoxGeometry(.4,.2,3),M(0x6b645a),NS);
for(let i=0;i<NS;i++){const s=i*2+1;put(sl,i,s,H(s)+.1,0,slope(s,1))}sc.add(sl);
const NR=END/10,rails=new T.InstancedMesh(new T.BoxGeometry(10.05,.18,.12),M(0xb8bcc4,{metalness:.8,roughness:.3}),NR*2),
  deck=new T.InstancedMesh(new T.BoxGeometry(10.05,.8,5.6),M(0x9a9a96),NR);
for(let j=0;j<NR;j++){const s=j*10+5,a=slope(s,5);put(rails,j*2,s,H(s)+.28,-.72,a);put(rails,j*2+1,s,H(s)+.28,.72,a);put(deck,j,s,H(s)-.5,0,a)}
sc.add(rails,deck);deck.receiveShadow=true;
