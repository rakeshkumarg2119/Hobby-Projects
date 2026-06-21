// ─────────────────────────────────────── UTILITIES ───────────────────────
function showSection(id, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (btn) btn.classList.add('active');
}

const ANIMATION_SCALE = 1;
const ACTION_DELAY_MS = 300;

function sleep(ms) {
  return new Promise(r => setTimeout(r, Math.max(0, Math.round(ms * ANIMATION_SCALE))));
}

function log(logId, msg, type='') {
  const el = document.getElementById(logId);
  if (!el) return;
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">[${new Date().toLocaleTimeString()}]</span><span class="${type ? 'log-'+type : ''}">${msg}</span>`;
  el.appendChild(entry);
  el.scrollTop = el.scrollHeight;
}

function addIterStep(containerId, stepNum, arr, action, type='') {
  const c = document.getElementById(containerId);
  if (!c) return;
  const d = document.createElement('div');
  d.className = `iter-step ${type}`;
  d.innerHTML = `<span class="iter-num">Step ${stepNum}</span><span class="iter-arr">[${arr.join(', ')}]</span><span class="iter-action">${action}</span>`;
  c.appendChild(d);
  c.scrollTop = c.scrollHeight;
}

function clearIterSteps(id) { const el = document.getElementById(id); if(el) el.innerHTML=''; }

// ─────────────────────────────────────── ARRAY DS ───────────────────────
let arrData = [10, 20, 30, 40, 50];

function renderArr(highlight=-1, found=-1, deleted=-1) {
  const viz = document.getElementById('arr-viz');
  viz.innerHTML = '';
  arrData.forEach((v, i) => {
    const cell = document.createElement('div'); cell.className = 'array-cell';
    const box = document.createElement('div');
    box.className = 'array-box';
    if (i === found) box.classList.add('found');
    else if (i === deleted) box.classList.add('deleted');
    else if (i === highlight) box.classList.add('highlight');
    box.textContent = v;
    const idx = document.createElement('div'); idx.className='array-index'; idx.textContent=`[${i}]`;
    cell.append(box, idx); viz.appendChild(cell);
  });
}

function arrInsert() {
  const v = parseInt(document.getElementById('arr-input').value);
  const i = parseInt(document.getElementById('arr-idx').value);
  if (isNaN(v)) return;
  const idx = isNaN(i) ? arrData.length : Math.max(0, Math.min(i, arrData.length));
  arrData.splice(idx, 0, v);
  renderArr(idx);
  log('arr-log', `Inserted ${v} at index ${idx}. Array size: ${arrData.length}`, 'info');
}

function arrSearch() {
  const v = parseInt(document.getElementById('arr-input').value);
  const idx = arrData.indexOf(v);
  if (idx >= 0) { renderArr(-1, idx); log('arr-log', `Found ${v} at index ${idx}`, 'info'); }
  else { renderArr(); log('arr-log', `${v} not found in array`, 'error'); }
}

function arrDelete() {
  const i = parseInt(document.getElementById('arr-idx').value);
  if (isNaN(i) || i < 0 || i >= arrData.length) { log('arr-log', 'Invalid index', 'error'); return; }
  const v = arrData[i];
  renderArr(-1, -1, i);
  setTimeout(() => { arrData.splice(i, 1); renderArr(); log('arr-log', `Deleted ${v} at index ${i}`, 'warn'); }, ACTION_DELAY_MS);
}

function arrReset() { arrData = [10,20,30,40,50]; renderArr(); log('arr-log','Array reset','info'); }

async function arrTraverse() {
  log('arr-log', 'Traversing array...', 'info');
  for (let i=0; i<arrData.length; i++) {
    renderArr(i);
    log('arr-log', `→ Index ${i}: ${arrData[i]}`);
    await sleep(400);
  }
  renderArr();
  log('arr-log', `Traversal complete. Result: [${arrData.join(', ')}]`, 'info');
}
renderArr();

// ─────────────────────────────────────── LINKED LIST DS ───────────────────────
let llHead = null;
class LLNode { constructor(v){ this.val=v; this.next=null; } }

function llRender(highlightVal=-1, foundVal=-1, deletedVal=-1) {
  const viz = document.getElementById('ll-viz');
  viz.innerHTML = '';
  let cur = llHead;
  if (!cur) { viz.innerHTML = '<span style="color:var(--text-muted);font-size:0.85rem">Empty list — HEAD → NULL</span>'; return; }
  while (cur) {
    const node = document.createElement('div'); node.className='ll-node';
    const box = document.createElement('div'); box.className='ll-box';
    if (cur.val===highlightVal) box.classList.add('highlight');
    if (cur.val===foundVal) box.classList.add('found');
    if (cur.val===deletedVal) box.classList.add('deleted');
    const valDiv = document.createElement('div'); valDiv.className='ll-val'; valDiv.textContent=cur.val;
    const nxtDiv = document.createElement('div'); nxtDiv.className='ll-next'; nxtDiv.textContent='next→';
    box.append(valDiv, nxtDiv); node.appendChild(box); viz.appendChild(node);
    if (cur.next) { const arr = document.createElement('div'); arr.className='ll-arrow'; viz.appendChild(arr); }
    cur = cur.next;
  }
  const nullEl = document.createElement('div'); nullEl.className='ll-null'; nullEl.textContent='NULL'; viz.appendChild(nullEl);
}

function llInsertHead() {
  const v = parseInt(document.getElementById('ll-input').value); if(isNaN(v))return;
  const n = new LLNode(v); n.next = llHead; llHead = n;
  llRender(v); log('ll-log', `Inserted ${v} at head`, 'info');
}
function llInsertTail() {
  const v = parseInt(document.getElementById('ll-input').value); if(isNaN(v))return;
  const n = new LLNode(v);
  if (!llHead) { llHead=n; } else { let c=llHead; while(c.next) c=c.next; c.next=n; }
  llRender(v); log('ll-log', `Inserted ${v} at tail`, 'info');
}
function llSearch() {
  const v = parseInt(document.getElementById('ll-input').value); if(isNaN(v))return;
  let c=llHead,i=0;
  while(c){ if(c.val===v){ llRender(-1,v); log('ll-log',`Found ${v} at position ${i}`,'info'); return; } c=c.next; i++; }
  log('ll-log',`${v} not found`,'error');
}
function llDelete() {
  const v = parseInt(document.getElementById('ll-input').value); if(isNaN(v))return;
  if (!llHead) return;
  if (llHead.val===v) { llRender(-1,-1,v); setTimeout(()=>{ llHead=llHead.next; llRender(); },ACTION_DELAY_MS); log('ll-log',`Deleted ${v}`,'warn'); return; }
  let c=llHead;
  while(c.next){ if(c.next.val===v){ llRender(-1,-1,v); setTimeout(()=>{ c.next=c.next.next; llRender(); },ACTION_DELAY_MS); log('ll-log',`Deleted ${v}`,'warn'); return; } c=c.next; }
  log('ll-log',`${v} not found`,'error');
}
async function llTraverse() {
  let c=llHead,i=0;
  while(c){ llRender(c.val); log('ll-log',`Position ${i}: ${c.val}`); await sleep(400); c=c.next; i++; }
  llRender(); log('ll-log','Traversal complete','info');
}
function llReset() {
  llHead = null;
  [5, 10, 15, 20].forEach(v => {
    const n = new LLNode(v);
    if (!llHead) { llHead = n; } else { let c = llHead; while (c.next) c = c.next; c.next = n; }
  });
  llRender(); log('ll-log', 'List reset', 'info');
}
llReset();

// ─────────────────────────────────────── DOUBLY LINKED LIST ───────────────────────
let dllHead=null, dllTail=null;
class DLLNode{constructor(v){this.val=v;this.prev=null;this.next=null;}}

function dllRender(hv=-1,fv=-1,dv=-1){
  const viz=document.getElementById('dll-viz'); viz.innerHTML='';
  if(!dllHead){viz.innerHTML='<span style="color:var(--text-muted);font-size:0.85rem">Empty list</span>';return;}
  const nullL=document.createElement('div');nullL.className='ll-null';nullL.textContent='NULL';viz.appendChild(nullL);
  let cur=dllHead;
  while(cur){
    const arr=document.createElement('div');arr.className='dll-arrow-back';viz.appendChild(arr);
    const node=document.createElement('div');node.className='ll-node';
    const box=document.createElement('div');box.className='ll-box';
    if(cur.val===hv)box.classList.add('highlight');
    if(cur.val===fv)box.classList.add('found');
    if(cur.val===dv)box.classList.add('deleted');
    const prev=document.createElement('div');prev.className='dll-prev';prev.textContent='←prev';
    const val=document.createElement('div');val.className='ll-val';val.textContent=cur.val;
    const nxt=document.createElement('div');nxt.className='ll-next';nxt.textContent='next→';
    box.append(prev,val,nxt);node.appendChild(box);viz.appendChild(node);
    cur=cur.next;
  }
  const nullR=document.createElement('div');nullR.className='ll-null';nullR.textContent='NULL';viz.appendChild(nullR);
}

function dllInsertHead(){
  const v=parseInt(document.getElementById('dll-input').value);if(isNaN(v))return;
  const n=new DLLNode(v);
  if(!dllHead){dllHead=dllTail=n;}else{n.next=dllHead;dllHead.prev=n;dllHead=n;}
  dllRender(v);log('dll-log',`Inserted ${v} at head`,'info');
}
function dllInsertTail(){
  const v=parseInt(document.getElementById('dll-input').value);if(isNaN(v))return;
  const n=new DLLNode(v);
  if(!dllTail){dllHead=dllTail=n;}else{n.prev=dllTail;dllTail.next=n;dllTail=n;}
  dllRender(v);log('dll-log',`Inserted ${v} at tail`,'info');
}
function dllSearch(){
  const v=parseInt(document.getElementById('dll-input').value);if(isNaN(v))return;
  let c=dllHead,i=0;
  while(c){if(c.val===v){dllRender(-1,v);log('dll-log',`Found ${v} at pos ${i}`,'info');return;}c=c.next;i++;}
  log('dll-log',`${v} not found`,'error');
}
function dllDelete(){
  const v=parseInt(document.getElementById('dll-input').value);if(isNaN(v))return;
  let c=dllHead;
  while(c){
    if(c.val===v){
      dllRender(-1,-1,v);
      setTimeout(()=>{
        if(c.prev)c.prev.next=c.next;else dllHead=c.next;
        if(c.next)c.next.prev=c.prev;else dllTail=c.prev;
        dllRender();
      },ACTION_DELAY_MS);
      log('dll-log',`Deleted ${v}`,'warn');return;
    }
    c=c.next;
  }
  log('dll-log',`${v} not found`,'error');
}
function dllReset(){
  dllHead=dllTail=null;
  [10,20,30,40].forEach(v=>{const n=new DLLNode(v);if(!dllHead){dllHead=dllTail=n;}else{n.prev=dllTail;dllTail.next=n;dllTail=n;}});
  dllRender();log('dll-log','List reset','info');
}
dllReset();

// ─────────────────────────────────────── BINARY TREE ───────────────────────
class BTNode{constructor(v){this.val=v;this.left=null;this.right=null;}}

let btRoot=null;
function btInsertNode(root,val){
  if(!root)return new BTNode(val);
  if(val<root.val)root.left=btInsertNode(root.left,val);
  else root.right=btInsertNode(root.right,val);
  return root;
}

function btGetPositions(root,x,y,spread,level){
  if(!root)return[];
  const pos=[{node:root,x,y}];
  if(root.left)pos.push(...btGetPositions(root.left,x-spread,y+60,spread/2,level+1));
  if(root.right)pos.push(...btGetPositions(root.right,x+spread,y+60,spread/2,level+1));
  return pos;
}

function btRender(svg,root,highlights=[]){
  svg.innerHTML='';
  if(!root){svg.innerHTML='<text x="200" y="50" fill="#64748b" font-family="monospace" font-size="12">Empty tree</text>';return;}
  const positions=btGetPositions(root,300,35,120,0);
  const posMap=new Map(positions.map(p=>[p.node,p]));
  // Draw edges first
  positions.forEach(({node,x,y})=>{
    if(node.left){const c=posMap.get(node.left);const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',x);l.setAttribute('y1',y);l.setAttribute('x2',c.x);l.setAttribute('y2',c.y);l.setAttribute('stroke','#2a2a3f');l.setAttribute('stroke-width','1.5');svg.appendChild(l);}
    if(node.right){const c=posMap.get(node.right);const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',x);l.setAttribute('y1',y);l.setAttribute('x2',c.x);l.setAttribute('y2',c.y);l.setAttribute('stroke','#2a2a3f');l.setAttribute('stroke-width','1.5');svg.appendChild(l);}
  });
  // Draw nodes
  positions.forEach(({node,x,y})=>{
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','tree-node');
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','20');
    if(highlights.includes(node.val))c.setAttribute('class','highlight');
    g.appendChild(c);
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',x);t.setAttribute('y',y);t.textContent=node.val;g.appendChild(t);
    svg.appendChild(g);
  });
}

function btInsert(){
  const v=parseInt(document.getElementById('bt-input').value);if(isNaN(v))return;
  btRoot=btInsertNode(btRoot,v);
  btRender(document.getElementById('bt-svg'),btRoot,[v]);
  log('bt-log',`Inserted ${v}`,'info');
}

async function btInorder(){
  const result=[]; const hl=[];
  async function traverse(n){
    if(!n)return;
    await traverse(n.left);
    result.push(n.val);hl.push(n.val);
    btRender(document.getElementById('bt-svg'),btRoot,[...hl]);
    await sleep(500);
    await traverse(n.right);
  }
  await traverse(btRoot);
  log('bt-log',`In-order: [${result.join(', ')}]`,'info');
  btRender(document.getElementById('bt-svg'),btRoot);
}

async function btPreorder(){
  const result=[]; const hl=[];
  async function traverse(n){
    if(!n)return;
    result.push(n.val);hl.push(n.val);
    btRender(document.getElementById('bt-svg'),btRoot,[...hl]);
    await sleep(500);
    await traverse(n.left);
    await traverse(n.right);
  }
  await traverse(btRoot);
  log('bt-log',`Pre-order: [${result.join(', ')}]`,'info');
  btRender(document.getElementById('bt-svg'),btRoot);
}

async function btPostorder(){
  const result=[]; const hl=[];
  async function traverse(n){
    if(!n)return;
    await traverse(n.left);
    await traverse(n.right);
    result.push(n.val);hl.push(n.val);
    btRender(document.getElementById('bt-svg'),btRoot,[...hl]);
    await sleep(500);
  }
  await traverse(btRoot);
  log('bt-log',`Post-order: [${result.join(', ')}]`,'info');
  btRender(document.getElementById('bt-svg'),btRoot);
}

async function btBFS(){
  if(!btRoot)return;
  const q=[btRoot],result=[],hl=[];
  while(q.length){
    const n=q.shift(); result.push(n.val); hl.push(n.val);
    btRender(document.getElementById('bt-svg'),btRoot,[...hl]);
    await sleep(500);
    if(n.left)q.push(n.left);
    if(n.right)q.push(n.right);
  }
  log('bt-log',`BFS: [${result.join(', ')}]`,'info');
  btRender(document.getElementById('bt-svg'),btRoot);
}

function btReset(){
  btRoot=null;
  [50,30,70,20,40,60,80].forEach(v=>{ btRoot=btInsertNode(btRoot,v); });
  btRender(document.getElementById('bt-svg'),btRoot);
  log('bt-log','Tree reset','info');
}
btReset();

// ─────────────────────────────────────── BST ───────────────────────
let bstRoot=null;
function bstInsertNode(root,val){
  if(!root)return new BTNode(val);
  if(val<root.val)root.left=bstInsertNode(root.left,val);
  else if(val>root.val)root.right=bstInsertNode(root.right,val);
  return root;
}
function bstDeleteNode(root,val){
  if(!root)return null;
  if(val<root.val){root.left=bstDeleteNode(root.left,val);}
  else if(val>root.val){root.right=bstDeleteNode(root.right,val);}
  else{
    if(!root.left)return root.right;
    if(!root.right)return root.left;
    let suc=root.right;
    while(suc.left)suc=suc.left;
    root.val=suc.val;
    root.right=bstDeleteNode(root.right,suc.val);
  }
  return root;
}

function bstInsert(){
  const v=parseInt(document.getElementById('bst-input').value);if(isNaN(v))return;
  bstRoot=bstInsertNode(bstRoot,v);
  btRender(document.getElementById('bst-svg'),bstRoot,[v]);
  log('bst-log',`Inserted ${v}. BST property maintained.`,'info');
}

async function bstSearch(){
  const v=parseInt(document.getElementById('bst-input').value);if(isNaN(v))return;
  let cur=bstRoot, steps=0, path=[];
  while(cur){
    path.push(cur.val);
    btRender(document.getElementById('bst-svg'),bstRoot,path);
    await sleep(600);
    steps++;
    if(v===cur.val){ log('bst-log',`Found ${v} in ${steps} steps`,'info'); return; }
    if(v<cur.val)cur=cur.left; else cur=cur.right;
  }
  log('bst-log',`${v} not found after ${steps} steps`,'error');
}

function bstDelete(){
  const v=parseInt(document.getElementById('bst-input').value);if(isNaN(v))return;
  bstRoot=bstDeleteNode(bstRoot,v);
  btRender(document.getElementById('bst-svg'),bstRoot);
  log('bst-log',`Deleted ${v}`,'warn');
}

async function bstInorder(){
  const r=[],hl=[];
  async function t(n){if(!n)return;await t(n.left);r.push(n.val);hl.push(n.val);btRender(document.getElementById('bst-svg'),bstRoot,[...hl]);await sleep(400);await t(n.right);}
  await t(bstRoot);
  log('bst-log',`In-order (sorted): [${r.join(', ')}]`,'info');
  btRender(document.getElementById('bst-svg'),bstRoot);
}

function bstReset(){
  bstRoot=null;
  [50,30,70,20,40,60,80,10,25,35,45].forEach(v=>bstRoot=bstInsertNode(bstRoot,v));
  btRender(document.getElementById('bst-svg'),bstRoot);
  log('bst-log','BST reset','info');
}
bstReset();

// ─────────────────────────────────────── GRAPH ───────────────────────
let graphNodes=new Map(), graphEdges=[];

function graphAddEdge(){
  const f=document.getElementById('graph-from').value.trim().toUpperCase();
  const t=document.getElementById('graph-to').value.trim().toUpperCase();
  const w=parseInt(document.getElementById('graph-weight').value)||1;
  if(!f||!t)return;
  if(!graphNodes.has(f))graphNodes.set(f,{label:f});
  if(!graphNodes.has(t))graphNodes.set(t,{label:t});
  graphEdges.push({from:f,to:t,weight:w});
  graphRenderStatic();
  log('graph-log',`Added edge ${f} → ${t} (weight: ${w})`,'info');
}

function graphRenderStatic(visited=[],current=''){
  const svg=document.getElementById('graph-svg');
  svg.innerHTML='';
  const nodes=[...graphNodes.keys()];
  const n=nodes.length;
  const cx=300,cy=150,r=120;
  const positions={};
  nodes.forEach((nd,i)=>{
    const angle=(2*Math.PI*i/n)-Math.PI/2;
    positions[nd]={x:cx+r*Math.cos(angle),y:cy+r*Math.sin(angle)};
  });

  // Draw edges
  graphEdges.forEach(e=>{
    const p1=positions[e.from],p2=positions[e.to];if(!p1||!p2)return;
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',p1.x);line.setAttribute('y1',p1.y);line.setAttribute('x2',p2.x);line.setAttribute('y2',p2.y);
    line.setAttribute('class',visited.includes(e.from)&&visited.includes(e.to)?'graph-edge visited':'graph-edge');
    svg.appendChild(line);
    const mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2;
    const wt=document.createElementNS('http://www.w3.org/2000/svg','text');
    wt.setAttribute('x',mx);wt.setAttribute('y',my-6);wt.setAttribute('class','edge-weight');wt.textContent=e.weight;
    svg.appendChild(wt);
  });

  // Draw nodes
  nodes.forEach(nd=>{
    const {x,y}=positions[nd];
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','graph-node');
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',20);
    if(nd===current)c.setAttribute('class','current');
    else if(visited.includes(nd))c.setAttribute('class','visited');
    g.appendChild(c);
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('fill','#e2e8f0');
    t.setAttribute('font-family','monospace');t.setAttribute('font-size','12');
    t.setAttribute('text-anchor','middle');t.setAttribute('dominant-baseline','middle');t.setAttribute('font-weight','700');
    t.textContent=nd;g.appendChild(t);svg.appendChild(g);
  });
}

async function graphBFS(){
  const nodes=[...graphNodes.keys()];if(!nodes.length)return;
  const start=nodes[0], visited=[], queue=[start];
  const adj=buildAdj();
  while(queue.length){
    const cur=queue.shift();
    if(visited.includes(cur))continue;
    visited.push(cur);
    graphRenderStatic(visited,cur);
    log('graph-log',`BFS visiting: ${cur}`,'info');
    await sleep(700);
    (adj.get(cur)||[]).forEach(n=>{ if(!visited.includes(n))queue.push(n); });
  }
  graphRenderStatic(visited);
  log('graph-log',`BFS order: ${visited.join(' → ')}`,'info');
}

async function graphDFS(){
  const nodes=[...graphNodes.keys()];if(!nodes.length)return;
  const start=nodes[0], visited=[];
  const adj=buildAdj();
  async function dfs(n){
    if(visited.includes(n))return;
    visited.push(n);
    graphRenderStatic(visited,n);
    log('graph-log',`DFS visiting: ${n}`,'info');
    await sleep(700);
    for(const nb of (adj.get(n)||[])){ await dfs(nb); }
  }
  await dfs(start);
  graphRenderStatic(visited);
  log('graph-log',`DFS order: ${visited.join(' → ')}`,'info');
}

function buildAdj(){
  const adj=new Map();
  graphEdges.forEach(e=>{
    if(!adj.has(e.from))adj.set(e.from,[]);
    adj.get(e.from).push(e.to);
  });
  return adj;
}

function graphReset(){
  graphNodes=new Map();graphEdges=[];
  [['A','B',4],['A','C',2],['B','D',5],['C','D',1],['D','E',3],['B','E',8],['C','E',9]].forEach(([f,t,w])=>{
    if(!graphNodes.has(f))graphNodes.set(f,{label:f});
    if(!graphNodes.has(t))graphNodes.set(t,{label:t});
    graphEdges.push({from:f,to:t,weight:w});
  });
  graphRenderStatic();
  log('graph-log','Graph reset with default edges','info');
}
graphReset();

// ─────────────────────────────────────── SORTING HELPERS ───────────────────────
function parseArr(id){ return document.getElementById(id).value.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x)); }

function renderBars(id, arr, highlights={}) {
  const c=document.getElementById(id); if(!c)return;
  const max=Math.max(...arr,1);
  c.innerHTML='';
  arr.forEach((v,i)=>{
    const b=document.createElement('div');
    b.className='bar '+(highlights[i]||'');
    b.style.height=`${Math.max(8,(v/max)*160)}px`;
    b.textContent=v;
    c.appendChild(b);
  });
}

function renderArrBoxes(id, arr, cls='') {
  const c=document.getElementById(id); if(!c)return;
  c.innerHTML='';
  arr.forEach((v,i)=>{
    const cell=document.createElement('div');cell.className='array-cell';
    const box=document.createElement('div');box.className=`array-box ${cls}`;box.textContent=v;
    const idx=document.createElement('div');idx.className='array-index';idx.textContent=`[${i}]`;
    cell.append(box,idx);c.appendChild(cell);
  });
}

// ─────────────────────────────────────── INSERTION SORT ───────────────────────
let insState={arr:[],steps:[],stepIdx:0,running:false};

function insertionSortReset(){
  const arr=parseArr('ins-input');
  insState={arr:[...arr],steps:[],stepIdx:0,running:false};
  renderBars('ins-bars',arr);
  renderArrBoxes('ins-before',arr);
  document.getElementById('ins-after').innerHTML='';
  clearIterSteps('ins-steps');
}

function generateInsertionSteps(arr){
  const a=[...arr],steps=[];
  for(let i=1;i<a.length;i++){
    const key=a[i]; let j=i-1;
    steps.push({arr:[...a],action:`Pass ${i}: key=${key}`,type:'pass',hl:{[i]:'highlight'}});
    while(j>=0&&a[j]>key){
      a[j+1]=a[j];
      steps.push({arr:[...a],action:`Shift ${a[j]} right`,type:'swap',hl:{[j]:'compare',[j+1]:'highlight'}});
      j--;
    }
    a[j+1]=key;
    steps.push({arr:[...a],action:`Placed ${key} at index ${j+1}`,type:'',hl:{[j+1]:'sorted'}});
  }
  steps.push({arr:[...a],action:'Sorting complete!',type:'done',hl:{}});
  return{steps,sorted:[...a]};
}

function insertionSortStep(){
  if(!insState.steps.length){
    const arr=parseArr('ins-input');
    const {steps,sorted}=generateInsertionSteps(arr);
    insState={arr:[...arr],steps,sorted,stepIdx:0,running:false};
    renderArrBoxes('ins-before',arr);
    renderArrBoxes('ins-after',sorted,'sorted');
  }
  if(insState.stepIdx>=insState.steps.length)return;
  const s=insState.steps[insState.stepIdx++];
  renderBars('ins-bars',s.arr,s.hl);
  addIterStep('ins-steps',insState.stepIdx,s.arr,s.action,s.type);
}

async function insertionSortRun(){
  const arr=parseArr('ins-input');
  const {steps,sorted}=generateInsertionSteps(arr);
  insState={arr:[...arr],steps,sorted,stepIdx:0,running:true};
  clearIterSteps('ins-steps');
  renderArrBoxes('ins-before',arr);
  renderArrBoxes('ins-after',sorted,'sorted');
  const spd=()=>parseInt(document.getElementById('ins-speed').value)||600;
  for(const s of steps){
    if(!insState.running)break;
    renderBars('ins-bars',s.arr,s.hl);
    addIterStep('ins-steps',++insState.stepIdx,s.arr,s.action,s.type);
    await sleep(1600-spd());
  }
}

insertionSortReset();

// ─────────────────────────────────────── BUBBLE SORT ───────────────────────
let bubState={steps:[],stepIdx:0,running:false};

function bubbleSortReset(){
  const arr=parseArr('bub-input');
  bubState={steps:[],stepIdx:0,running:false};
  renderBars('bub-bars',arr);
  renderArrBoxes('bub-before',arr);
  document.getElementById('bub-after').innerHTML='';
  clearIterSteps('bub-steps');
}

function generateBubbleSteps(arr){
  const a=[...arr],steps=[],n=a.length;
  for(let i=0;i<n-1;i++){
    let swapped=false;
    steps.push({arr:[...a],action:`Pass ${i+1} begins`,type:'pass',hl:{}});
    for(let j=0;j<n-i-1;j++){
      steps.push({arr:[...a],action:`Compare a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}`,type:'',hl:{[j]:'compare',[j+1]:'compare'}});
      if(a[j]>a[j+1]){
        [a[j],a[j+1]]=[a[j+1],a[j]]; swapped=true;
        steps.push({arr:[...a],action:`Swap ${a[j+1]} ↔ ${a[j]}`,type:'swap',hl:{[j]:'highlight',[j+1]:'highlight'}});
      }
    }
    if(!swapped){steps.push({arr:[...a],action:'No swaps — array sorted early!',type:'done',hl:{}});break;}
  }
  steps.push({arr:[...a],action:'Sorting complete!',type:'done',hl:{}});
  return{steps,sorted:[...a]};
}

function bubbleSortStep(){
  if(!bubState.steps.length){
    const arr=parseArr('bub-input');
    const{steps,sorted}=generateBubbleSteps(arr);
    bubState={steps,sorted,stepIdx:0};
    renderArrBoxes('bub-before',arr);
    renderArrBoxes('bub-after',sorted,'sorted');
  }
  if(bubState.stepIdx>=bubState.steps.length)return;
  const s=bubState.steps[bubState.stepIdx++];
  renderBars('bub-bars',s.arr,s.hl);
  addIterStep('bub-steps',bubState.stepIdx,s.arr,s.action,s.type);
}

async function bubbleSortRun(){
  const arr=parseArr('bub-input');
  const{steps,sorted}=generateBubbleSteps(arr);
  bubState={steps,sorted,stepIdx:0,running:true};
  clearIterSteps('bub-steps');
  renderArrBoxes('bub-before',arr);
  renderArrBoxes('bub-after',sorted,'sorted');
  const spd=()=>parseInt(document.getElementById('bub-speed').value)||600;
  for(const s of steps){
    renderBars('bub-bars',s.arr,s.hl);
    addIterStep('bub-steps',++bubState.stepIdx,s.arr,s.action,s.type);
    await sleep(1600-spd());
  }
}

bubbleSortReset();

// ─────────────────────────────────────── SELECTION SORT ───────────────────────
let selState={steps:[],stepIdx:0,running:false};

function selectionSortReset(){
  const arr=parseArr('sel-input');
  selState={steps:[],stepIdx:0,running:false};
  renderBars('sel-bars',arr);
  renderArrBoxes('sel-before',arr);
  document.getElementById('sel-after').innerHTML='';
  clearIterSteps('sel-steps');
}

function generateSelectionSteps(arr){
  const a=[...arr],steps=[],n=a.length;
  for(let i=0;i<n-1;i++){
    let minIdx=i;
    steps.push({arr:[...a],action:`Pass ${i+1}: find min from index ${i}`,type:'pass',hl:{[i]:'highlight'}});
    for(let j=i+1;j<n;j++){
      steps.push({arr:[...a],action:`Check a[${j}]=${a[j]} vs min=${a[minIdx]}`,type:'',hl:{[minIdx]:'highlight',[j]:'compare'}});
      if(a[j]<a[minIdx])minIdx=j;
    }
    if(minIdx!==i){
      [a[i],a[minIdx]]=[a[minIdx],a[i]];
      steps.push({arr:[...a],action:`Swap a[${i}]=${a[minIdx]} ↔ a[${minIdx}]=${a[i]}`,type:'swap',hl:{[i]:'sorted',[minIdx]:'highlight'}});
    } else {
      steps.push({arr:[...a],action:`a[${i}]=${a[i]} already in place`,type:'',hl:{[i]:'sorted'}});
    }
  }
  steps.push({arr:[...a],action:'Sorting complete!',type:'done',hl:{}});
  return{steps,sorted:[...a]};
}

function selectionSortStep(){
  if(!selState.steps.length){
    const arr=parseArr('sel-input');
    const{steps,sorted}=generateSelectionSteps(arr);
    selState={steps,sorted,stepIdx:0};
    renderArrBoxes('sel-before',arr);
    renderArrBoxes('sel-after',sorted,'sorted');
  }
  if(selState.stepIdx>=selState.steps.length)return;
  const s=selState.steps[selState.stepIdx++];
  renderBars('sel-bars',s.arr,s.hl);
  addIterStep('sel-steps',selState.stepIdx,s.arr,s.action,s.type);
}

async function selectionSortRun(){
  const arr=parseArr('sel-input');
  const{steps,sorted}=generateSelectionSteps(arr);
  selState={steps,sorted,stepIdx:0,running:true};
  clearIterSteps('sel-steps');
  renderArrBoxes('sel-before',arr);
  renderArrBoxes('sel-after',sorted,'sorted');
  for(const s of steps){
    renderBars('sel-bars',s.arr,s.hl);
    addIterStep('sel-steps',++selState.stepIdx,s.arr,s.action,s.type);
    await sleep(700);
  }
}

selectionSortReset();

// ─────────────────────────────────────── MERGE SORT ───────────────────────
function mergeSortReset(){
  const arr=parseArr('mrg-input');
  renderBars('mrg-bars',arr);
  renderArrBoxes('mrg-before',arr);
  document.getElementById('mrg-after').innerHTML='';
  clearIterSteps('mrg-steps');
}

let mrgStepNum=0;
function generateMergeSteps(arr){
  const steps=[];
  let stepN=0;
  function mergeSort(a,l,r){
    if(l>=r)return;
    const m=Math.floor((l+r)/2);
    mergeSort(a,l,m);
    mergeSort(a,m+1,r);
    merge(a,l,m,r);
  }
  function merge(a,l,m,r){
    const left=a.slice(l,m+1),right=a.slice(m+1,r+1);
    let i=0,j=0,k=l;
    steps.push({arr:[...a],action:`Merging [${l}..${m}] and [${m+1}..${r}]`,type:'pass',hl:{}});
    while(i<left.length&&j<right.length){
      if(left[i]<=right[j]){a[k++]=left[i++];}
      else{a[k++]=right[j++];}
      steps.push({arr:[...a],action:`Merge step k=${k-1}: placed ${a[k-1]}`,type:'',hl:{[k-1]:'compare'}});
    }
    while(i<left.length){a[k++]=left[i++];steps.push({arr:[...a],action:`Copy left: ${a[k-1]}`,type:'',hl:{[k-1]:'sorted'}});}
    while(j<right.length){a[k++]=right[j++];steps.push({arr:[...a],action:`Copy right: ${a[k-1]}`,type:'',hl:{[k-1]:'sorted'}});}
  }
  const a=[...arr];
  mergeSort(a,0,a.length-1);
  steps.push({arr:[...a],action:'Merge sort complete!',type:'done',hl:{}});
  return{steps,sorted:[...a]};
}

async function mergeSortRun(){
  const arr=parseArr('mrg-input');
  const{steps,sorted}=generateMergeSteps(arr);
  clearIterSteps('mrg-steps');
  renderArrBoxes('mrg-before',arr);
  renderArrBoxes('mrg-after',sorted,'sorted');
  let n=0;
  for(const s of steps){
    renderBars('mrg-bars',s.arr,s.hl);
    addIterStep('mrg-steps',++n,s.arr,s.action,s.type);
    await sleep(400);
  }
}

mergeSortReset();

// ─────────────────────────────────────── QUICK SORT ───────────────────────
function quickSortReset(){
  const arr=parseArr('qck-input');
  renderBars('qck-bars',arr);
  renderArrBoxes('qck-before',arr);
  document.getElementById('qck-after').innerHTML='';
  clearIterSteps('qck-steps');
}

function generateQuickSteps(arr){
  const a=[...arr],steps=[];
  function partition(a,lo,hi){
    const pivot=a[hi]; let i=lo-1;
    steps.push({arr:[...a],action:`Pivot=${pivot} (index ${hi}), partitioning [${lo}..${hi}]`,type:'pass',hl:{[hi]:'pivot'}});
    for(let j=lo;j<hi;j++){
      steps.push({arr:[...a],action:`Compare a[${j}]=${a[j]} with pivot=${pivot}`,type:'',hl:{[j]:'compare',[hi]:'pivot'}});
      if(a[j]<=pivot){
        i++;
        [a[i],a[j]]=[a[j],a[i]];
        if(i!==j)steps.push({arr:[...a],action:`Swap a[${i}]=${a[j]} ↔ a[${j}]=${a[i]}`,type:'swap',hl:{[i]:'highlight',[j]:'highlight',[hi]:'pivot'}});
      }
    }
    [a[i+1],a[hi]]=[a[hi],a[i+1]];
    steps.push({arr:[...a],action:`Place pivot ${pivot} at index ${i+1}`,type:'swap',hl:{[i+1]:'sorted'}});
    return i+1;
  }
  function qs(a,lo,hi){
    if(lo<hi){ const p=partition(a,lo,hi); qs(a,lo,p-1); qs(a,p+1,hi); }
  }
  qs(a,0,a.length-1);
  steps.push({arr:[...a],action:'Quick sort complete!',type:'done',hl:{}});
  return{steps,sorted:[...a]};
}

async function quickSortRun(){
  const arr=parseArr('qck-input');
  const{steps,sorted}=generateQuickSteps(arr);
  clearIterSteps('qck-steps');
  renderArrBoxes('qck-before',arr);
  renderArrBoxes('qck-after',sorted,'sorted');
  let n=0;
  for(const s of steps){
    renderBars('qck-bars',s.arr,s.hl);
    addIterStep('qck-steps',++n,s.arr,s.action,s.type);
    await sleep(450);
  }
}

quickSortReset();

// ─────────────────────────────────────── SHELL SORT ───────────────────────
function shellSortReset(){
  const arr=parseArr('shl-input');
  renderBars('shl-bars',arr);
  renderArrBoxes('shl-before',arr);
  document.getElementById('shl-after').innerHTML='';
  clearIterSteps('shl-steps');
}

function generateShellSteps(arr){
  const a=[...arr],steps=[],n=a.length;
  let gap=Math.floor(n/2);
  while(gap>0){
    steps.push({arr:[...a],action:`Gap = ${gap}`,type:'pass',hl:{}});
    for(let i=gap;i<n;i++){
      const tmp=a[i]; let j=i;
      while(j>=gap&&a[j-gap]>tmp){
        a[j]=a[j-gap];
        steps.push({arr:[...a],action:`Move a[${j-gap}]=${a[j]} → a[${j}]`,type:'swap',hl:{[j]:'highlight',[j-gap]:'compare'}});
        j-=gap;
      }
      a[j]=tmp;
      steps.push({arr:[...a],action:`Place ${tmp} at index ${j}`,type:'',hl:{[j]:'sorted'}});
    }
    gap=Math.floor(gap/2);
  }
  steps.push({arr:[...a],action:'Shell sort complete!',type:'done',hl:{}});
  return{steps,sorted:[...a]};
}

async function shellSortRun(){
  const arr=parseArr('shl-input');
  const{steps,sorted}=generateShellSteps(arr);
  clearIterSteps('shl-steps');
  renderArrBoxes('shl-before',arr);
  renderArrBoxes('shl-after',sorted,'sorted');
  let n=0;
  for(const s of steps){
    renderBars('shl-bars',s.arr,s.hl);
    addIterStep('shl-steps',++n,s.arr,s.action,s.type);
    await sleep(400);
  }
}

shellSortReset();

// ─────────────────────────────────────── RADIX SORT ───────────────────────
function radixSortReset(){
  const arr=parseArr('rdx-input');
  renderBars('rdx-bars',arr);
  renderArrBoxes('rdx-before',arr);
  document.getElementById('rdx-after').innerHTML='';
  clearIterSteps('rdx-steps');
  showRadixBuckets(arr,0);
}

function showRadixBuckets(arr,pass){
  const c=document.getElementById('radix-buckets-display');
  const buckets=Array.from({length:10},()=>[]);
  const div=Math.pow(10,pass);
  arr.forEach(v=>{ const d=Math.floor(v/div)%10; buckets[d].push(v); });
  let html=`<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:0.5rem">`;
  buckets.forEach((b,i)=>{
    html+=`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:0.4rem;text-align:center">
      <div style="font-size:0.65rem;color:var(--accent2);margin-bottom:0.3rem">Bucket ${i}</div>
      ${b.map(v=>`<div style="background:var(--accent);color:white;border-radius:3px;padding:2px 4px;font-size:0.7rem;margin:1px">${v}</div>`).join('')||'<div style="font-size:0.65rem;color:var(--text-muted)">empty</div>'}
    </div>`;
  });
  html+='</div>';
  c.innerHTML=html;
}

function generateRadixSteps(arr){
  const a=[...arr],steps=[],n=a.length;
  const max=Math.max(...a);
  let exp=1;
  while(Math.floor(max/exp)>0){
    const output=new Array(n);
    const count=new Array(10).fill(0);
    for(let i=0;i<n;i++)count[Math.floor(a[i]/exp)%10]++;
    for(let i=1;i<10;i++)count[i]+=count[i-1];
    steps.push({arr:[...a],action:`Digit pass (exp=${exp}): counting digits`,type:'pass',hl:{}});
    for(let i=n-1;i>=0;i--){
      const d=Math.floor(a[i]/exp)%10;
      output[count[d]-1]=a[i];
      count[d]--;
    }
    for(let i=0;i<n;i++)a[i]=output[i];
    steps.push({arr:[...a],action:`After exp=${exp} pass: array redistributed`,type:'swap',hl:{}});
    exp*=10;
  }
  steps.push({arr:[...a],action:'Radix sort complete!',type:'done',hl:{}});
  return{steps,sorted:[...a]};
}

async function radixSortRun(){
  const arr=parseArr('rdx-input');
  const{steps,sorted}=generateRadixSteps(arr);
  clearIterSteps('rdx-steps');
  renderArrBoxes('rdx-before',arr);
  renderArrBoxes('rdx-after',sorted,'sorted');
  let n=0;
  for(const s of steps){
    renderBars('rdx-bars',s.arr,s.hl);
    addIterStep('rdx-steps',++n,s.arr,s.action,s.type);
    await sleep(600);
  }
}

radixSortReset();

// ─────────────────────────────────────── BUCKET SORT ───────────────────────
function bucketSortReset(){
  const arr=parseArr('bkt-input');
  document.getElementById('bkt-bars').innerHTML='';
  renderArrBoxes('bkt-before',arr);
  document.getElementById('bkt-after').innerHTML='';
  clearIterSteps('bkt-steps');
}

function generateBucketSteps(arr){
  const a=[...arr],steps=[],n=a.length;
  const numBuckets=n;
  const buckets=Array.from({length:numBuckets},()=>[]);
  const min=Math.min(...a),max=Math.max(...a);
  const range=max-min||1;
  
  // Distribute
  a.forEach(v=>{
    const bi=Math.min(Math.floor(((v-min)/range)*numBuckets),numBuckets-1);
    buckets[bi].push(v);
  });
  steps.push({arr:[...a],action:`Distributed ${n} elements into ${numBuckets} buckets`,type:'pass',hl:{}});

  // Sort each bucket
  const sorted=[];
  buckets.forEach((b,i)=>{
    b.sort((x,y)=>x-y);
    if(b.length>0){steps.push({arr:[...sorted,...b],action:`Sorted bucket ${i}: [${b.join(',')}]`,type:'swap',hl:{}});}
    sorted.push(...b);
  });
  steps.push({arr:[...sorted],action:'Concatenated all buckets — done!',type:'done',hl:{}});
  return{steps,sorted};
}

async function bucketSortRun(){
  const arr=parseArr('bkt-input');
  const{steps,sorted}=generateBucketSteps(arr);
  clearIterSteps('bkt-steps');
  renderArrBoxes('bkt-before',arr);
  renderArrBoxes('bkt-after',sorted,'sorted');
  let n=0;
  const maxVal=Math.max(...sorted);
  for(const s of steps){
    // render as bars
    const c=document.getElementById('bkt-bars');
    c.innerHTML='';
    s.arr.forEach((v,i)=>{
      const b=document.createElement('div');
      b.className='bar '+(s.hl[i]||'');
      b.style.height=`${Math.max(8,(v/maxVal)*160)}px`;
      b.textContent=v.toFixed(2);
      c.appendChild(b);
    });
    addIterStep('bkt-steps',++n,s.arr.map(v=>v.toFixed(2)),s.action,s.type);
    await sleep(700);
  }
}

bucketSortReset();

// ─────────────────────────────────────── BINARY SEARCH ───────────────────────
let binState={arr:[],steps:[],stepIdx:0};

function binarySearchReset(){
  binState={arr:[],steps:[],stepIdx:0};
  const arr=parseArr('bin-arr').sort((a,b)=>a-b);
  renderBinaryState(arr,0,0,arr.length-1,{});
  clearIterSteps('bin-steps');
  document.getElementById('bin-log').innerHTML='';
}

function generateBinarySteps(arr,target){
  const steps=[],n=arr.length;
  let lo=0,hi=n-1;
  while(lo<=hi){
    const mid=Math.floor((lo+hi)/2);
    const hl={};
    for(let i=lo;i<=hi;i++)hl[i]='compare';
    hl[lo]=''; hl[hi]='';
    const hlFinal={};
    for(let i=lo;i<=hi;i++)hlFinal[i]='compare';
    steps.push({arr:[...arr],lo,mid,hi,action:`lo=${lo}, hi=${hi}, mid=${mid}, arr[mid]=${arr[mid]}`,hl:{...hlFinal,[lo]:'compare',[hi]:'compare',[mid]:'highlight'}});
    if(arr[mid]===target){
      steps.push({arr:[...arr],lo,mid,hi,action:`Found ${target} at index ${mid}!`,type:'done',hl:{[mid]:'found'}});
      return{steps,foundIdx:mid};
    } else if(arr[mid]<target){
      steps.push({arr:[...arr],lo:mid+1,mid,hi,action:`arr[mid]=${arr[mid]} < ${target}, search right half`,hl:{[mid]:'compare'}});
      lo=mid+1;
    } else {
      steps.push({arr:[...arr],lo,mid,hi:mid-1,action:`arr[mid]=${arr[mid]} > ${target}, search left half`,hl:{[mid]:'compare'}});
      hi=mid-1;
    }
  }
  steps.push({arr:[...arr],action:`${target} not found`,type:'done',hl:{}});
  return{steps,foundIdx:-1};
}

function renderBinaryState(arr,lo,mid,hi,hl={}){
  const c=document.getElementById('bin-viz'); c.innerHTML='';
  arr.forEach((v,i)=>{
    const cell=document.createElement('div');cell.className='array-cell';
    const box=document.createElement('div');box.className='array-box';
    if(hl[i]==='found')box.classList.add('found');
    else if(i===mid&&hl[i]!=='found')box.classList.add('highlight');
    else if(hl[i]==='compare'){}
    else if(i<lo||i>hi)box.style.opacity='0.3';
    const idx=document.createElement('div');idx.className='array-index';
    let label=`[${i}]`;
    if(i===lo)label+=' L';
    if(i===mid)label+=' M';
    if(i===hi)label+=' H';
    idx.textContent=label;
    if(i===lo)idx.style.color='var(--accent2)';
    if(i===mid)idx.style.color='var(--highlight)';
    if(i===hi)idx.style.color='var(--danger)';
    box.textContent=v;cell.append(box,idx);c.appendChild(cell);
  });
}

function binarySearchStep(){
  const arr=parseArr('bin-arr').sort((a,b)=>a-b);
  const target=parseInt(document.getElementById('bin-target').value);
  if(!binState.steps.length){
    const{steps}=generateBinarySteps(arr,target);
    binState={arr,steps,stepIdx:0};
    clearIterSteps('bin-steps');
  }
  if(binState.stepIdx>=binState.steps.length)return;
  const s=binState.steps[binState.stepIdx++];
  renderBinaryState(s.arr,s.lo??0,s.mid??0,s.hi??(arr.length-1),s.hl||{});
  addIterStep('bin-steps',binState.stepIdx,s.arr,s.action,s.type||'');
}

async function binarySearchRun(){
  const arr=parseArr('bin-arr').sort((a,b)=>a-b);
  const target=parseInt(document.getElementById('bin-target').value);
  const{steps}=generateBinarySteps(arr,target);
  binState={arr,steps,stepIdx:0};
  clearIterSteps('bin-steps');
  document.getElementById('bin-log').innerHTML='';
  let n=0;
  for(const s of steps){
    renderBinaryState(s.arr,s.lo??0,s.mid??0,s.hi??(arr.length-1),s.hl||{});
    addIterStep('bin-steps',++n,s.arr,s.action,s.type||'');
    log('bin-log',s.action,s.type==='done'?(s.action.includes('Found')?'info':'error'):'');
    await sleep(700);
  }
}

binarySearchReset();

// ─────────────────────────────────────── FIBONACCI SEARCH ───────────────────────
let fibState={steps:[],stepIdx:0};

function fibSearchReset(){
  fibState={steps:[],stepIdx:0};
  const arr=parseArr('fib-arr');
  renderArrBoxes('fib-viz',arr);
  clearIterSteps('fib-steps');
  document.getElementById('fib-log').innerHTML='';
  // Show fibonacci sequence
  const c=document.getElementById('fib-seq-viz');
  let a=0,b=1,fibs=[0,1];
  while(b<200){const t=a+b;a=b;b=t;fibs.push(b);}
  fibs=fibs.slice(0,12);
  c.innerHTML='';
  fibs.forEach((v,i)=>{
    const cell=document.createElement('div');cell.className='array-cell';
    const box=document.createElement('div');box.className='array-box';box.style.borderColor='var(--accent3)';box.textContent=v;
    const idx=document.createElement('div');idx.className='array-index';idx.textContent=`F(${i})`;
    cell.append(box,idx);c.appendChild(cell);
  });
}

function generateFibSteps(arr,target){
  const steps=[],n=arr.length;
  let fibM2=0,fibM1=1,fibM=fibM2+fibM1;
  while(fibM<n){fibM2=fibM1;fibM1=fibM;fibM=fibM2+fibM1;}
  let offset=-1, stepArr=[...arr];
  const hl={};
  while(fibM>1){
    const i=Math.min(offset+fibM2,n-1);
    hl[i]='highlight';
    steps.push({arr:[...arr],action:`Fib(m)=${fibM}, Fib(m-1)=${fibM1}, Fib(m-2)=${fibM2}. Check index ${i}: arr[${i}]=${arr[i]}`,hl:{[i]:'highlight'}});
    if(arr[i]<target){fibM=fibM1;fibM1=fibM2;fibM2=fibM-fibM1;offset=i;steps.push({arr:[...arr],action:`arr[${i}]=${arr[i]} < ${target}, move right`,hl:{[i]:'compare'}});}
    else if(arr[i]>target){fibM=fibM2;fibM1=fibM1-fibM2;fibM2=fibM-fibM1;steps.push({arr:[...arr],action:`arr[${i}]=${arr[i]} > ${target}, move left`,hl:{[i]:'compare'}});}
    else{steps.push({arr:[...arr],action:`Found ${target} at index ${i}!`,type:'done',hl:{[i]:'found'}});return{steps,foundIdx:i};}
  }
  if(fibM1&&arr[offset+1]===target){
    steps.push({arr:[...arr],action:`Found ${target} at index ${offset+1}!`,type:'done',hl:{[offset+1]:'found'}});
    return{steps,foundIdx:offset+1};
  }
  steps.push({arr:[...arr],action:`${target} not found`,type:'done',hl:{}});
  return{steps,foundIdx:-1};
}

function renderFibState(arr,hl={}){
  const c=document.getElementById('fib-viz'); c.innerHTML='';
  arr.forEach((v,i)=>{
    const cell=document.createElement('div');cell.className='array-cell';
    const box=document.createElement('div');box.className='array-box';
    if(hl[i]==='found')box.classList.add('found');
    else if(hl[i]==='highlight')box.classList.add('highlight');
    else if(hl[i]==='compare')box.classList.add('compare');
    box.textContent=v;
    const idx=document.createElement('div');idx.className='array-index';idx.textContent=`[${i}]`;
    cell.append(box,idx);c.appendChild(cell);
  });
}

function fibSearchStep(){
  const arr=parseArr('fib-arr');
  const target=parseInt(document.getElementById('fib-target').value);
  if(!fibState.steps.length){
    const{steps}=generateFibSteps(arr,target);
    fibState={steps,stepIdx:0};
    clearIterSteps('fib-steps');
  }
  if(fibState.stepIdx>=fibState.steps.length)return;
  const s=fibState.steps[fibState.stepIdx++];
  renderFibState(s.arr,s.hl||{});
  addIterStep('fib-steps',fibState.stepIdx,s.arr,s.action,s.type||'');
}

async function fibSearchRun(){
  const arr=parseArr('fib-arr');
  const target=parseInt(document.getElementById('fib-target').value);
  const{steps}=generateFibSteps(arr,target);
  fibState={steps,stepIdx:0};
  clearIterSteps('fib-steps');
  document.getElementById('fib-log').innerHTML='';
  let n=0;
  for(const s of steps){
    renderFibState(s.arr,s.hl||{});
    addIterStep('fib-steps',++n,s.arr,s.action,s.type||'');
    log('fib-log',s.action,s.type==='done'?(s.action.includes('Found')?'info':'error'):'');
    await sleep(800);
  }
}

fibSearchReset();