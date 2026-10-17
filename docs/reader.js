(() => {
  'use strict';
  const D = window.BRAIN, publicMode = document.body.dataset.mode === 'public';
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const saved = window.BRAIN_DOCUMENTS || {documents: [], captured: ''};
  const memoryKey = publicMode ? 'yh_public_reading_v1' : 'yh_brain_reading_v1';
  let config, live = null, catalog = saved.documents, current = null, requestId = 0, headingObserver, findHits = [], hitIndex = -1, frame = 0;
  let returnHash = publicMode ? '#learning' : '#archive';
  let sourceMode = 'auto';
  let memory = {recent: [], bookmarks: [], positions: {}};
  try { memory = {...memory, ...JSON.parse(localStorage.getItem(memoryKey) || '{}')}; } catch (_) {}
  const persist = () => { try { localStorage.setItem(memoryKey, JSON.stringify(memory)); } catch (_) {} };
  const slug = text => text.toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
  const label = path => D.archive.find(x => x.path === path)?.title || catalog.find(x => x.path === path)?.title || path.split('/').at(-1);
  function normalize(path) {
    const parts = [];
    for (const part of path.replace(/\\/g, '/').split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') { if (!parts.length) return null; parts.pop(); } else parts.push(part);
    }
    return parts.join('/');
  }
  function resolveLink(href, path) {
    let raw; try { raw = decodeURIComponent(href); } catch (_) { raw = href; }
    if (raw.startsWith('#')) return {path, section:raw.slice(1)};
    if (/^https?:\/\/github\.com\/choiYhunn\/ai-shared-brain\/blob\//i.test(raw)) {
      const rest = raw.replace(/^https?:\/\/github\.com\/choiYhunn\/ai-shared-brain\/blob\//i, '');
      const known = catalog.map(x => x.path).sort((a,b)=>b.length-a.length).find(p => rest.split('#')[0].endsWith('/'+p));
      if (known) return {path:known, section:raw.split('#')[1] || ''};
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) return null;
    const [file, section = ''] = raw.split('#');
    const clean = file.split('?')[0];
    const relative = clean.startsWith('/') || /^(brain|docs|skills)\//.test(clean) ? clean.replace(/^\//, '') : path.slice(0, path.lastIndexOf('/') + 1) + clean;
    const resolved = normalize(relative);
    return resolved ? {path:resolved, section} : null;
  }
  function link(path, text, extra = '') { return `<a href="${hashFor(path)}" ${extra}>${esc(text || label(path))}</a>`; }
  function hashFor(path, section = '', mode = sourceMode) {
    const query=new URLSearchParams();if(section)query.set('section',section);if(mode!=='auto'&&!publicMode)query.set('source',mode);
    return '#doc/'+encodeURIComponent(path)+(query.size?'?'+query.toString():'');
  }
  function parseRoute() {
    if (!location.hash.startsWith('#doc/')) return null;
    const [encoded, query = ''] = location.hash.slice(5).split('?');
    try { const params=new URLSearchParams(query),source=params.get('source');return {path:decodeURIComponent(encoded), section:params.get('section') || '', source:['auto','local','github','saved'].includes(source)?source:'auto'}; } catch (_) { return null; }
  }
  function savePosition() {
    if (!current || !$('#document.active')) return;
    memory.positions[current.path+'|'+current.mode] = {ratio:Math.min(1, Math.max(0, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))), updated:Date.now()};
    persist();
  }
  function updateShelf() {
    const shelf = $('#readingShelf');
    if (!shelf) return;
    const recent = memory.recent.filter(p=>catalog.some(x=>x.path===p)).slice(0,3);
    shelf.hidden = !recent.length;
    shelf.innerHTML = '<div class="kicker">최근에 읽은 기록</div>'+recent.map(p=>link(p,label(p))).join('');
  }
  function updateBookmark() {
    if (!current) return;
    const active = memory.bookmarks.includes(current.path);
    $('#readerBookmark').setAttribute('aria-pressed', String(active));
    $('#readerBookmark').textContent = active ? '저장됨 ✓' : '읽기 목록에 저장';
  }
  function metadata(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) return {body:content, values:[]};
    const values = match[1].split(/\r?\n/).filter(l=>/^[\w-]+\s*:/.test(l)).map(l=>{
      const split = l.indexOf(':'); return [l.slice(0,split).trim(), l.slice(split+1).trim().replace(/^(['"])(.*)\1$/, '$2')];
    }).filter(([,v])=>v);
    return {body:content.slice(match[0].length), values, raw:match[1]};
  }
  function jsonView(value, name = '', depth = 0) {
    if (value === null || typeof value !== 'object') return `<div class="json-value">${name?`<b>${esc(name)}</b> `:''}<span class="json-${typeof value}">${esc(typeof value === 'string' ? value : JSON.stringify(value))}</span></div>`;
    const entries = Object.entries(value);
    return `<details class="json-node" ${depth<2?'open':''}><summary>${esc(name || (Array.isArray(value)?'목록':'문서 데이터'))} <span>${entries.length}개 ${Array.isArray(value)?'항목':'필드'}</span></summary><div>${entries.map(([k,v])=>jsonView(v,Array.isArray(value)?String(+k+1):k,depth+1)).join('')}</div></details>`;
  }
  function renderBody(doc) {
    const meta = metadata(doc.content), type = doc.path.split('.').at(-1).toLowerCase();
    const body = $('#readerBody');
    $('#readerMetadata').hidden = !meta.values.length;
    const names = {last_curated:'마지막 정리', status:'상태', period:'기간', course:'수업', scope:'범위', source:'출처', title:'제목', date:'날짜'};
    $('#readerMetadata').innerHTML = '<summary>문서 정보</summary><dl>'+meta.values.map(([k,v])=>`<div><dt>${esc(names[k]||k)}</dt><dd>${esc(v)}</dd></div>`).join('')+'</dl>';
    $('#readerDataTools').hidden = type !== 'json';
    if (type === 'json') {
      try { body.innerHTML = jsonView(JSON.parse(doc.content)); } catch (_) { body.innerHTML = '<p class="reader-note">JSON 구문이 완전하지 않아 파일 내용으로 표시합니다.</p><pre><code class="language-json">'+esc(doc.content)+'</code></pre>'; }
    } else if (type === 'md') {
      // Preserve LaTeX before Markdown consumes backslashes and underscores.
      const math = [];
      const protectedText = meta.body.replace(/(```[\s\S]*?```|`[^`\n]+`)|(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g, (all,code,formula)=>{
        if (code) return code;
        const display = formula.startsWith('$$') || formula.startsWith('\\[');
        let tex = formula.slice(2,-2);
        const index = math.push({tex,display})-1;
        return `YHMATHPLACEHOLDER${index}END`;
      });
      let html = marked.parse(protectedText, {gfm:true, breaks:false});
      html = DOMPurify.sanitize(html, {USE_PROFILES:{html:true}, SANITIZE_NAMED_PROPS:true, FORBID_TAGS:['style','form','iframe','object','embed','script','textarea','select','button'], FORBID_ATTR:['style']});
      body.innerHTML = html;
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
      const textNodes = []; while (walker.nextNode()) if (/YHMATHPLACEHOLDER\d+END/.test(walker.currentNode.textContent)) textNodes.push(walker.currentNode);
      textNodes.forEach(node=>{
        const frag = document.createDocumentFragment();
        const text = node.textContent; let pos = 0;
        for (const match of text.matchAll(/YHMATHPLACEHOLDER(\d+)END/g)) {
          frag.append(text.slice(pos,match.index));
          const span = document.createElement('span'), formula = math[+match[1]];
          span.className = formula.display?'math-block':'math-inline';
          try { katex.render(formula.tex, span, {displayMode:formula.display,throwOnError:false,trust:false,strict:'ignore'}); } catch (_) { span.textContent=formula.tex; }
          frag.append(span); pos=match.index+match[0].length;
        }
        frag.append(text.slice(pos)); node.replaceWith(frag);
      });
      if (window.renderMathInElement) renderMathInElement(body,{delimiters:[{left:'$',right:'$',display:false}],throwOnError:false,trust:false,strict:'ignore',ignoredTags:['script','noscript','style','textarea','pre','code','option']});
    } else { body.innerHTML = `<pre><code class="language-${type==='yml'?'yaml':type==='yaml'?'yaml':'plaintext'}">${esc(doc.content)}</code></pre>`; }
    body.querySelectorAll('input').forEach(i=>{if(i.type!=='checkbox')i.remove();else i.disabled=true;});
    const first = body.querySelector('h1');
    const title = first?.textContent || doc.title || label(doc.path);
    $('#readerTitle').textContent = title;
    if (first) { const anchor=document.createElement('span');anchor.id='yh-doc-'+slug(first.textContent);first.replaceWith(anchor); }
    document.title = title+' · Yonghun '+(publicMode?'Portfolio':'Brain');
    const ids = new Map();
    if(first)ids.set(slug(first.textContent),1);
    body.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h=>{
      const base=slug(h.textContent)||'section', n=ids.get(base)||0;ids.set(base,n+1);h.dataset.section=base+(n?'-'+n:'');h.id='yh-doc-'+h.dataset.section;
      const a=document.createElement('a');a.className='heading-anchor';a.href=hashFor(doc.path,h.dataset.section);a.setAttribute('aria-label',h.textContent+' 섹션 링크');a.textContent='#';h.append(a);
    });
    body.querySelectorAll('table').forEach(table=>{const wrap=document.createElement('div');wrap.className='reader-table';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','표, 가로 스크롤 가능');table.replaceWith(wrap);wrap.append(table);});
    body.querySelectorAll('pre').forEach(pre=>{
      const code=pre.querySelector('code'); if(code && window.hljs) { try { hljs.highlightElement(code); } catch (_) {} }
      const tools=document.createElement('div');tools.className='code-tools';
      const language=code?.className.match(/language-([\w-]+)/)?.[1] || 'text';
      tools.innerHTML=`<span>${esc(language)}</span><button type="button">코드 복사</button>`;
      tools.querySelector('button').onclick=()=>copy(code?.textContent||pre.textContent,'코드를 복사했습니다.');
      pre.prepend(tools);
    });
    body.querySelectorAll('a[href]').forEach(a=>{
      if(a.classList.contains('heading-anchor'))return;
      const href=a.getAttribute('href'), target=resolveLink(href,doc.path);
      if(target && /\.(md|json|txt|ya?ml)$/.test(target.path)) { a.href=hashFor(target.path,target.section); a.dataset.document=target.path; }
      else if(target && href.startsWith('#'))a.href=hashFor(doc.path,target.section);
      else if(/^https?:|^mailto:/.test(href)) {a.target='_blank';a.rel='noopener noreferrer';}
      else { a.removeAttribute('href');a.classList.add('unavailable-link');a.title='이 로컬 읽기 화면에서 열 수 없는 참조입니다.'; }
    });
    // Bare canonical paths in code spans are first-class navigation too.
    body.querySelectorAll('code').forEach(code=>{
      if(code.closest('pre'))return;
      const text=code.textContent.trim();
      if(/^(brain|docs)\/[\w./%-]+\.(md|json|txt|ya?ml)$/.test(text) && !code.closest('a')) {
        const a=document.createElement('a');a.href=hashFor(text);code.replaceWith(a);a.append(code);
      }
    });
    body.querySelectorAll('img').forEach(img=>{
      const src=img.getAttribute('src'), target=resolveLink(src,doc.path);
      img.loading='lazy';
      if(target && live?.ok && !publicMode) img.src='/api/asset?path='+encodeURIComponent(target.path);
      else if(target || !/^https?:/.test(src)) { const note=document.createElement('span');note.className='reader-note';note.textContent='이미지: '+(img.alt||src)+' (로컬 Brain 연결 시 표시)';img.replaceWith(note); }
    });
    const headings=[...body.querySelectorAll('h1,h2,h3,h4')];
    $('#readerToc').innerHTML=headings.length?headings.map(h=>`<a href="${hashFor(doc.path,h.dataset.section)}" data-heading="${esc(h.id)}" class="toc-level-${h.tagName[1]}">${esc(h.textContent.replace(/#$/,''))}</a>`).join(''):'<span class="muted">이 문서에는 소제목이 없습니다.</span>';
    headingObserver?.disconnect();
    headingObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if(visible)$('#readerToc').querySelectorAll('a').forEach(a=>{const active=a.dataset.heading===visible.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    },{rootMargin:'-90px 0px -55% 0px'});
    headings.forEach(h=>headingObserver.observe(h));
    const chars=meta.body.replace(/\s/g,'').length;
    $('#readerLength').textContent=`약 ${Math.max(1,Math.ceil(chars/650))}분 · ${new Intl.NumberFormat('ko').format(chars)}자`;
    $('#readerRaw').textContent=doc.content;
    $('#readerBody').hidden=false;$('#readerRaw').hidden=true;
    $('#readerRenderedTab').setAttribute('aria-selected','true');$('#readerRawTab').setAttribute('aria-selected','false');
    $('#readerMetadata').open=false;
    $('#readerTocDisclosure').open=innerWidth>990;
    $('#readerActionDisclosure').open=innerWidth>790;
    $('#readerFindDisclosure').open=innerWidth>790;
    findHits=[];hitIndex=-1;$('#readerFindInput').value='';$('#readerFindResult').textContent='';
  }
  function related(doc) {
    const known=new Set(catalog.map(x=>x.path));
    const out=new Set(doc.links || []);
    $('#readerBody').querySelectorAll('a').forEach(a=>{if(a.hash.startsWith('#doc/')){try{out.add(decodeURIComponent(a.hash.slice(5).split('?')[0]));}catch(_){}}});
    const outgoing=[...out].filter(p=>p!==doc.path&&known.has(p));
    const incoming=catalog.filter(x=>x.path!==doc.path && (x.links||[]).includes(doc.path));
    const folder=doc.path.slice(0,doc.path.lastIndexOf('/'));
    const neighbors=catalog.filter(x=>x.path!==doc.path && x.path.slice(0,x.path.lastIndexOf('/'))===folder).slice(0,6);
    const projects=D.projects.filter(p=>(p.sources||[]).includes(doc.path));
    $('#readerRelated').innerHTML=`${projects.length?'<h3>이 기록을 쓰는 프로젝트</h3>'+projects.map(p=>`<a href="#project/${encodeURIComponent(p.id)}">${esc(p.title)}</a>`).join(''):''}${outgoing.length?'<h3>본문에서 이어지는 기록</h3>'+outgoing.slice(0,12).map(p=>link(p)).join(''):''}${incoming.length?'<h3>이 문서를 참조하는 기록</h3>'+incoming.slice(0,12).map(x=>link(x.path)).join(''):''}${neighbors.length?'<h3>같은 폴더의 기록</h3>'+neighbors.map(x=>link(x.path)).join(''):''}`;
    $('#readerMobileRelated').innerHTML=$('#readerRelated').innerHTML?'<details><summary>관련 기록과 참조</summary>'+$('#readerRelated').innerHTML+'</details>':'';
    const ordered=catalog.filter(x=>x.path.startsWith('brain/')).sort((a,b)=>a.path.localeCompare(b.path)), index=ordered.findIndex(x=>x.path===doc.path);
    $('#readerNeighbors').innerHTML=(index>0?link(ordered[index-1].path,'← '+label(ordered[index-1].path)):'<span></span>')+(index>=0&&index<ordered.length-1?link(ordered[index+1].path,label(ordered[index+1].path)+' →'):'');
  }
  function scrollSection(section) {
    let id;try{id=decodeURIComponent(section);}catch(_){id=section;}
    const el=document.getElementById('yh-doc-'+id)||document.getElementById('yh-doc-'+slug(id))||document.getElementById('user-content-'+id);
    if(el&&el.closest('#readerBody')) {el.scrollIntoView({block:'start',behavior:'instant'});el.tabIndex=-1;el.focus({preventScroll:true});}
  }
  async function route() {
    const target=parseRoute();if(!target)return false;
    if(current?.path===target.path && current.mode===target.source && $('#document.active')) {if(target.section)scrollSection(target.section);return true;}
    savePosition();
    config.show('document',false);
    $('#readerBack').textContent=returnHash.startsWith('#project/')?'← 프로젝트로 돌아가기':returnHash==='#learning'?'← 공부 화면으로':'← 기록 목록으로';
    sourceMode=publicMode?'auto':target.source;$('#readerSource').value=sourceMode;
    headingObserver?.disconnect();
    $('#readerRaw').textContent='';$('#readerAnnouncement').textContent='';
    $('#readerBody').innerHTML='<p class="reader-note" role="status">문서를 읽고 있습니다…</p>';
    $('#readerTitle').textContent=label(target.path);$('#readerPath').textContent=target.path;
    $('#readerState').textContent='불러오는 중';$('#readerRelated').innerHTML='';$('#readerMobileRelated').innerHTML='';$('#readerToc').innerHTML='';$('#readerNeighbors').innerHTML='';
    $('#readerMetadata').hidden=true;$('#readerDataTools').hidden=true;$('#readerResume').hidden=true;$('#readerRaw').hidden=true;$('#readerBody').hidden=false;
    $('#readerActions').hidden=true;
    const request=++requestId;
    let doc = null, origin = publicMode?'공개용 설명 · snapshot':'저장한 원문 · '+saved.captured, error='';
    if(live?.ok && !publicMode && sourceMode!=='saved') {
      try {
        const response=await fetch('/api/doc?path='+encodeURIComponent(target.path)+'&source='+sourceMode,{cache:'no-store'}), data=await response.json();
        if(response.ok) {doc=data;origin=data.source==='github'?(data.githubError?'저장된 GitHub main · ':'GitHub main · ')+(data.commit||'').slice(0,10):'로컬 원문 · 읽기 전용';error=data.githubError||'';}
        else error=response.status===404?'현재 로컬 clone에 이 경로의 문서가 없습니다.':data.error||'문서를 읽을 수 없습니다.';
      } catch (_) {error='로컬 연결이 끊어져 저장한 원문을 표시합니다.';}
    }
    if(!doc) {
      const pool=sourceMode==='github'?(saved.githubDocuments||[]):sourceMode==='local'?(saved.localDocuments||saved.documents):saved.documents;
      doc=pool.find(x=>x.path===target.path);
      if(doc?.source==='github')origin='저장한 GitHub main · '+(doc.commit||saved.githubCommit||'').slice(0,10);
      else if(doc && !publicMode)origin='저장한 로컬 원문 · '+saved.captured;
    }
    if(request!==requestId)return true;
    if(!doc || typeof doc.content!=='string') {
      current=null;
      const candidates=catalog.filter(x=>x.path.slice(0,x.path.lastIndexOf('/'))===target.path.slice(0,target.path.lastIndexOf('/'))).slice(0,8);
      $('#readerTitle').textContent=label(target.path);
      $('#readerState').textContent=publicMode?'공개 원문 미포함':'이 버전에 없는 기록';
      $('#readerBody').innerHTML=`<div class="reader-empty"><h2>${publicMode?'이 원문은 공개 묶음에 포함되지 않았습니다.':'이 문서를 찾지 못했습니다.'}</h2><p>${esc(error||'저장된 목록과 현재 clone의 파일 구성이 다릅니다. 현재 있는 기록을 아래에서 찾아 읽을 수 있습니다.')}</p>${publicMode?'<p>공개 프로젝트와 수업 설명은 해당 화면에서 계속 읽을 수 있습니다.</p>':''}${candidates.length?'<h3>같은 폴더에서 읽을 수 있는 기록</h3>'+candidates.map(x=>link(x.path)).join(''):''}<button class="btn" id="readerMissingBack">${publicMode?'공부 화면으로':'지난 기록으로'}</button></div>`;
      $('#readerMissingBack').onclick=()=>config.show(publicMode?'learning':'archive');
      $('#readerLength').textContent='';$('#readerNotice').hidden=true;return true;
    }
    current={...doc,path:target.path,mode:sourceMode};
    $('#readerState').textContent=origin;
    $('#readerNotice').hidden=!error;$('#readerNotice').textContent=error;
    $('#readerActions').hidden=false;
    renderBody(current);related(current);updateBookmark();
    memory.recent=[current.path,...memory.recent.filter(p=>p!==current.path)].slice(0,20);persist();updateShelf();
    const previous=memory.positions[current.path+'|'+current.mode]?.ratio || 0;
    $('#readerResume').hidden=previous<.05||previous>.98||!!target.section;
    $('#readerResume').textContent=`이전에 읽던 곳으로 (${Math.round(previous*100)}%)`;
    $('#readerResume').onclick=()=>{scrollTo({top:previous*Math.max(0,document.documentElement.scrollHeight-innerHeight),behavior:'instant'});$('#readerResume').hidden=true;};
    if(target.section)requestAnimationFrame(()=>scrollSection(target.section));
    else {$('#readerTitle').tabIndex=-1;$('#readerTitle').focus({preventScroll:true});}
    updateProgress();return true;
  }
  function open(path) { savePosition(); if(!location.hash.startsWith('#doc/'))returnHash=location.hash||returnHash; if(location.hash===hashFor(path))route();else location.hash=hashFor(path); }
  async function connect(status, refresh = false) {
    live = publicMode?null:status;
    if(live?.ok) {
      try {const response=await fetch('/api/catalog'+(refresh?'?refresh=1':''),{cache:'no-store'});if(response.ok){const result=await response.json();catalog=result.documents;config.onCatalog(catalog,'live');if(result.githubError)$('#archiveOrigin').textContent+=' · '+result.githubError;}} catch (_) { /* saved catalog remains readable */ }
    } else {catalog=saved.documents;config.onCatalog(catalog,'saved');}
    updateShelf();
    if(parseRoute()) {savePosition();current=null;await route();}
  }
  function updateProgress() {
    if(!$('#document.active'))return;
    const total=Math.max(1,document.documentElement.scrollHeight-innerHeight), percent=Math.max(0,Math.min(100,Math.round(scrollY/total*100)));
    $('#readerProgressBar').style.width=percent+'%';$('#readerProgress').textContent=percent+'%';
  }
  async function copy(text, message) {
    let success=false;
    try {await navigator.clipboard.writeText(text);success=true;} catch (_) {
      const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();success=document.execCommand('copy');area.remove();
    }
    $('#readerAnnouncement').textContent=success?message:'복사하지 못했습니다. 브라우저의 복사 권한을 확인해 주세요.';
  }
  function clearFind() {$('#readerBody').querySelectorAll('mark.reader-match').forEach(m=>m.replaceWith(m.textContent));$('#readerBody').normalize();findHits=[];hitIndex=-1;}
  function find() {
    clearFind();
    const query=$('#readerFindInput').value.trim();
    if(!query){$('#readerFindResult').textContent='';return;}
    if($('#readerBody').hidden){$('#readerRenderedTab').click();}
    const walker=document.createTreeWalker($('#readerBody'),NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement.closest('.code-tools,.heading-anchor,.katex')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    const q=query.toLocaleLowerCase();
    nodes.forEach(node=>{
      const text=node.textContent, lower=text.toLocaleLowerCase();let at=lower.indexOf(q),pos=0;if(at<0)return;
      const frag=document.createDocumentFragment();
      while(at>=0){frag.append(text.slice(pos,at));const mark=document.createElement('mark');mark.className='reader-match';mark.textContent=text.slice(at,at+query.length);frag.append(mark);findHits.push(mark);pos=at+query.length;at=lower.indexOf(q,pos);}
      frag.append(text.slice(pos));node.replaceWith(frag);
    });
    if(findHits.length)moveFind(1);else $('#readerFindResult').textContent='결과 없음';
  }
  function moveFind(step) {
    if(!findHits.length)return;
    findHits.forEach(m=>m.classList.remove('current'));hitIndex=(hitIndex+step+findHits.length)%findHits.length;
    const hit=findHits[hitIndex];hit.classList.add('current');hit.scrollIntoView({block:'center',behavior:'instant'});$('#readerFindResult').textContent=`${hitIndex+1} / ${findHits.length}`;
  }
  function init(options) {
    config=options;
    $('#readerSource').onchange=()=>{if(current)location.hash=hashFor(current.path,'',$('#readerSource').value);else {const route=parseRoute();if(route)location.hash=hashFor(route.path,'',$('#readerSource').value);}};
    $('#readerBack').onclick=()=>{savePosition();location.hash=returnHash;};
    $('#readerBookmark').onclick=()=>{if(!current)return;memory.bookmarks=memory.bookmarks.includes(current.path)?memory.bookmarks.filter(p=>p!==current.path):[current.path,...memory.bookmarks];persist();updateBookmark();config.onBookmarks?.();};
    $('#readerCopyLink').onclick=()=>copy(location.href,'문서 링크를 복사했습니다.');
    $('#readerDownload').onclick=()=>{
      if(!current)return;
      const url=URL.createObjectURL(new Blob([current.content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=current.path.split('/').at(-1);a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
    let printState=[];
    $('#readerPrint').onclick=()=>{printState=[...$('#readerBody').querySelectorAll('details'),$('#readerMetadata')].map(el=>[el,el.open]);printState.forEach(([el])=>el.open=true);document.body.classList.add('printing-reader');print();};
    window.addEventListener('afterprint',()=>{document.body.classList.remove('printing-reader');printState.forEach(([el,open])=>el.open=open);printState=[];});
    $('#readerRenderedTab').onclick=()=>{$('#readerBody').hidden=false;$('#readerRaw').hidden=true;$('#readerRenderedTab').setAttribute('aria-selected','true');$('#readerRawTab').setAttribute('aria-selected','false');};
    $('#readerRawTab').onclick=()=>{$('#readerBody').hidden=true;$('#readerRaw').hidden=false;$('#readerRenderedTab').setAttribute('aria-selected','false');$('#readerRawTab').setAttribute('aria-selected','true');};
    $('#readerRawTab').onkeydown=$('#readerRenderedTab').onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const next=e.target===$('#readerRawTab')?$('#readerRenderedTab'):$('#readerRawTab');next.click();next.focus();}};
    $('#readerExpandJson').onclick=()=>$('#readerBody').querySelectorAll('details').forEach(el=>el.open=true);
    $('#readerCollapseJson').onclick=()=>$('#readerBody').querySelectorAll('details').forEach(el=>el.open=false);
    $('#readerFindInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();find();}};
    $('#readerFindBtn').onclick=find;$('#readerFindNext').onclick=()=>moveFind(1);$('#readerFindPrev').onclick=()=>moveFind(-1);
    document.addEventListener('keydown',e=>{if($('#document.active')&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'){e.preventDefault();$('#readerFindDisclosure').open=true;$('#readerFindInput').focus();$('#readerFindInput').select();}});
    matchMedia('(max-width: 990px)').addEventListener('change',e=>$('#readerTocDisclosure').open=!e.matches);
    matchMedia('(max-width: 790px)').addEventListener('change',e=>{$('#readerActionDisclosure').open=!e.matches;$('#readerFindDisclosure').open=!e.matches;});
    window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;updateProgress();});},{passive:true});
    window.addEventListener('pagehide',savePosition);
    // Remember the outgoing document before app route changes visibility.
    window.addEventListener('hashchange',savePosition);
    updateShelf();
    config.onCatalog(catalog,'saved');
  }
  window.BrainReader={init,open,route,connect,savePosition,resolveLink,get catalog(){return catalog;},get bookmarks(){return memory.bookmarks;}};
})();
