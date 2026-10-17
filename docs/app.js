(() => {
  const D = window.BRAIN;
  const isPublic = document.body.dataset.mode === 'public';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let filter = '전체', activityFilter = '전체', currentProject = null, live = null, archiveVisible = 60;
  let records = D.archive, catalogOrigin = 'snapshot', bookmarkOnly = false;
  let theme = 'light', lastSearchFocus = null, sourceRequest = 0;
  try { theme = localStorage.getItem('yh_editorial_theme') || 'light'; } catch (_) {}
  const pageNames = {home:isPublic?'소개':'지금',projects:'프로젝트',activities:'활동',learning:'공부',map:'생각 지도',timeline:'시간의 흐름',decisions:'생각과 결정',evidence:'검증 기록',archive:'지난 기록',sources:'GitHub · Brain 연동',portfolio:'포트폴리오','project-detail':'프로젝트',document:'문서 읽기'};

  function setTheme() {
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
    $('#themeBtn').setAttribute('aria-label', theme === 'light' ? '어두운 화면으로 전환' : '밝은 화면으로 전환');
    $('#themeBtn').setAttribute('title', theme === 'light' ? '어두운 화면' : '밝은 화면');
    try { localStorage.setItem('yh_editorial_theme', theme); } catch (_) {}
  }
  function closeMenu() {
    $('#sidebar').classList.remove('open');
    $('#navShade').hidden = true;
    $('#menuBtn').setAttribute('aria-expanded','false');
  }
  function show(id, updateHash = true) {
    if (!pageNames[id] || !$('#'+id)) return;
    window.BrainReader?.savePosition();
    $$('.page').forEach(x => x.classList.toggle('active', x.id === id));
    $$('#nav button').forEach(b => {
      const active = b.dataset.page === (id === 'project-detail' ? 'projects' : id);
      b.classList.toggle('active',active);
      if (active) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
    });
    closeMenu();
    const hash = id === 'project-detail' ? 'project/'+currentProject.id : id;
    if (updateHash && location.hash.slice(1) !== hash) location.hash = hash;
    document.title = `${id === 'project-detail' ? currentProject.title : pageNames[id]} · Yonghun ${isPublic?'Portfolio':'Brain'}`;
    scrollTo({top:0,behavior:'instant'});
    const heading = $('#'+id+' h1');
    if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
  }
  function route() {
    const hash = location.hash.slice(1);
    if(hash.startsWith('doc/')) { window.BrainReader.route(); return; }
    if (hash.startsWith('project/')) {
      const p = D.projects.find(x => x.id === hash.slice(8));
      if (p) { currentProject = p; renderProjectDetail(); show('project-detail',false); return; }
    }
    const permitted = [...$$('#nav [data-page]')].map(b => b.dataset.page).concat('sources');
    show(permitted.includes(hash) ? hash : (isPublic?'portfolio':'home'),false);
  }
  function openProject(id) {
    currentProject = D.projects.find(p => p.id === id);
    if (!currentProject) return;
    renderProjectDetail(); show('project-detail');
  }
  function bindAction(selector, action) {
    $$(selector).forEach(el => {
      el.setAttribute('role','button'); el.tabIndex = 0;
      el.onclick = () => action(el);
      el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); action(el); } };
    });
  }
  function bullet(items) { return `<ul class="bullet-list">${items.map(x=>`<li class="bullet">${esc(x)}</li>`).join('')}</ul>`; }
  function section(title, content) { return `<section class="detail-section"><h3>${title}</h3><div class="body">${content}</div></section>`; }
  function projectButtons(scope = '') {
    bindAction(`${scope} [data-p]`, el=>openProject(el.dataset.p));
  }

  function renderHome() {
    $('#heroTitle').textContent = isPublic ? D.profile.name : '요즘의 나.';
    $('#heroSub').textContent = isPublic ? D.profile.headline : '삼성 DRAM Solution 현장실습에서 메모리 시스템을 검증하고 있습니다. 프로젝트와 공부, 그때의 판단을 AI Shared Brain에 이어서 기록합니다.';
    $('#heroDate').textContent = isPublic ? D.profile.school : `최용훈의 작업 노트 · ${D.snapshot.replaceAll('-','. ')}`;
    $('#profileSub').textContent = D.profile.sub;
    $('#profileHeadline').textContent = D.profile.headline;
    $('#profileSchool').textContent = D.profile.school;
    $('#todayGrid').innerHTML = D.today.map(x=>`<article class="focus-card" data-p="${esc(x.project)}" aria-label="${esc(x.title)} 자세히 보기"><span class="level">${esc(x.level)}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p><div class="arrow">자세히 읽기 ↗</div></article>`).join('');
    projectButtons('#todayGrid');
    const change = x=>`<article class="change"><time>${esc(x.date)}</time><strong>${esc(x.title)}</strong><p>${esc(x.text)}</p></article>`;
    $('#changeList').innerHTML = D.recentChanges.slice(0,2).map(change).join('');
    $('#moreChanges').innerHTML = D.recentChanges.slice(2).map(change).join('');
    $('#changeDisclosure').hidden = D.recentChanges.length <= 2;
    $('#homeEvidence').innerHTML = D.evidence.map(x=>`<div class="mini-evidence"><b>${esc(x.after)}</b><span>${esc(x.project)} · ${esc(x.event)}</span><small>${esc(x.before)} → ${esc(x.after)}</small></div>`).join('');
    const selected = D.projects.filter(p=>p.featured && p.public).slice(0,3);
    $('#homeProjects').innerHTML = selected.map(p=>`<article class="home-project"><div class="kicker">${esc(p.domain)}</div><h3>${esc(p.title)}</h3><p>${esc(p.oneLine)}</p><button class="section-link" data-p="${esc(p.id)}">프로젝트 읽기 ↗</button></article>`).join('');
    projectButtons('#homeProjects');
    $('#archiveCountHome').textContent = `${records.length}개의 기록`;
    if (isPublic) $$('.private-overview').forEach(el=>el.hidden=true);
  }
  function renderActivities() {
    const types = ['전체',...new Set(D.activities.map(x=>x.type))];
    $('#activityFilters').innerHTML = types.map(t=>`<button class="filter ${activityFilter===t?'active':''}" aria-pressed="${activityFilter===t}" data-af="${esc(t)}">${esc(t)}</button>`).join('');
    $$('[data-af]').forEach(b=>b.onclick=()=>{activityFilter=b.dataset.af;renderActivities();});
    const arr = D.activities.filter(x=>activityFilter==='전체'||x.type===activityFilter);
    $('#activityCount').textContent = `${arr.length}개의 활동`;
    $('#activityMasonry').innerHTML = arr.map(x=>`<article class="activity-card" ${x.project?`data-p="${esc(x.project)}"`:''}><div class="micro">${esc(x.type)} · ${esc(x.period)}</div><h3>${esc(x.title)}</h3><p>${esc(x.summary)}</p><footer><span>${esc(x.status)}</span>${x.project?'<span>자세히 읽기 ↗</span>':''}</footer></article>`).join('');
    projectButtons('#activityMasonry');
  }
  function renderLearning() {
    $('#courseGrid').innerHTML = D.courses.map(c=>`<article class="course-card" data-doc="${esc(c.link)}" aria-label="${esc(c.name)} 관련 기록"><div><div class="kicker">${esc(c.term)} · ${esc(c.status)}</div><h3>${esc(c.name)}</h3><p>${esc(c.story)}</p></div><div class="course-grade">${esc(c.grade)}<small>성적</small></div></article>`).join('');
    $('#programList').innerHTML = D.programs.map(p=>`<article class="program-card" data-doc="${esc(p.link)}"><header><h3>${esc(p.name)}</h3><small>${esc(p.status)}</small></header><p>${esc(p.story)}</p></article>`).join('');
    $('#knowledgeGarden').innerHTML = D.knowledgeDomains.map(k=>`<article class="knowledge-domain"${k.link?` data-doc="${esc(k.link)}" aria-label="${esc(k.name)} 기술 노트 읽기"`:''}><b>${esc(k.name)}</b><div class="count">${esc(k.count)}</div><div class="topic-cloud">${k.topics.map(t=>`<span>${esc(t)}</span>`).join('')}</div></article>`).join('');
    bindAction('[data-doc]',el=>openArchiveDoc(el.dataset.doc));
  }
  function archiveCounts() {
    const counts = {}; records.forEach(x=>counts[x.category]=(counts[x.category]||0)+1); return counts;
  }
  function renderArchive(reset=false) {
    if (reset) archiveVisible=60;
    const counts = archiveCounts();
    if (!$('#archiveCategory').options.length) $('#archiveCategory').innerHTML = ['전체',...Object.keys(counts).sort()].map(c=>`<option>${esc(c)}</option>`).join('');
    const q = $('#archiveSearch').value.trim().toLowerCase(), cat = $('#archiveCategory').value || '전체';
    let arr = records.filter(x=>(!bookmarkOnly||window.BrainReader.bookmarks.includes(x.path))&&(cat==='전체'||x.category===cat)&&(!q||(x.title+' '+x.path+' '+x.category+' '+(x.searchText||'')).toLowerCase().includes(q)));
    const order=$('#archiveSort')?.value||'title';
    arr.sort((a,b)=>order==='modified'?(b.modified||'').localeCompare(a.modified||''):order==='path'?a.path.localeCompare(b.path):a.title.localeCompare(b.title,'ko'));
    $('#archiveTotal').textContent = records.length;
    $('#archiveOrigin').textContent=catalogOrigin==='live'?'로컬 + GitHub main · 본문 검색':isPublic?'공개 설명 · snapshot':'저장한 원문 · '+(window.BRAIN_DOCUMENTS?.captured||D.snapshot);
    $('#archiveStats').innerHTML = [['전체',records.length],...Object.entries(counts).sort((a,b)=>b[1]-a[1])].map(([k,v])=>`<button class="archive-stat ${cat===k?'active':''}" aria-pressed="${cat===k}" data-category="${esc(k)}"><span>${esc(k)}</span><b>${v}</b></button>`).join('');
    $$('[data-category]').forEach(b=>b.onclick=()=>{$('#archiveCategory').value=b.dataset.category;renderArchive(true);});
    const groups = new Map();
    arr.slice(0,archiveVisible).forEach(x=>{if(!groups.has(x.category))groups.set(x.category,[]);groups.get(x.category).push(x);});
    $('#archiveList').innerHTML = [...groups].map(([category,items])=>`<section class="archive-group"><h2>${esc(category)}</h2>${items.map(x=>`<article class="archive-row" data-path="${esc(x.path)}" aria-label="${esc(x.title)} 원문 보기"><div><strong>${esc(x.title)}</strong><small>${esc(x.path)}</small>${x.excerpt?`<p class="archive-excerpt">${esc(x.excerpt.slice(0,150))}</p>`:''}</div><div class="ext">${esc(x.ext)}</div></article>`).join('')}</section>`).join('') || '<p class="empty-state">찾는 기록이 없습니다. 검색어나 분야를 바꿔보세요.</p>';
    $('#archiveResult').textContent = `${arr.length}개 중 ${Math.min(arr.length,archiveVisible)}개 표시 · 분야별로 모았습니다.`;
    bindAction('.archive-row',el=>openArchiveDoc(el.dataset.path));
    $('#archiveMore').hidden = archiveVisible >= arr.length;
    $('#archiveMore').onclick = ()=>{archiveVisible+=80;renderArchive();};
  }
  function openArchiveDoc(path) { window.BrainReader.open(path); }
  function renderProjects() {
    const domains=['전체',...new Set(D.projects.map(p=>p.domain.split(' · ')[0]))];
    $('#projectFilters').innerHTML = domains.map(d=>`<button class="filter ${filter===d?'active':''}" aria-pressed="${filter===d}" data-f="${esc(d)}">${esc(d)}</button>`).join('');
    $$('[data-f]').forEach(b=>b.onclick=()=>{filter=b.dataset.f;renderProjects();});
    const arr=D.projects.filter(p=>filter==='전체'||p.domain.startsWith(filter));
    $('#projectList').innerHTML=arr.map(p=>`<article class="project-row" data-p="${esc(p.id)}" aria-label="${esc(p.title)} 자세히 보기"><div class="project-meta">${esc(p.domain)}</div><div><h2>${esc(p.title)}</h2><p>${esc(p.oneLine)}</p></div><div class="project-status">${esc(p.status)}<span>자세히 읽기 ↗</span></div></article>`).join('');
    projectButtons('#projectList');
  }
  function renderProjectDetail() {
    const p=currentProject;
    const sources = p.sources.length ? p.sources.map(s=>`<button class="source-link" data-doc="${esc(s)}">${esc((window.BRAIN_DOCUMENTS?.documents||[]).find(d=>d.path===s)?.title||s)} ↗</button>`).join('') : '<p>이 페이지가 공개 가능한 프로젝트 설명의 전체입니다. 내부 canonical 원문은 개인 Brain에서 읽습니다.</p>';
    $('#projectDetail').innerHTML = `
      <header class="detail-hero"><div class="kicker">${esc(p.domain)}</div><h1>${esc(p.title)}</h1><p class="lead">${esc(p.oneLine)}</p><div class="detail-meta"><span class="pill">${esc(p.status)}</span><span class="pill">${p.public?'공개 가능한 설명':'개인 기록 · 계획 포함'}</span></div></header>
      ${section('왜 시작했나',`<p>${esc(p.why)}</p>`)}
      ${section('지금 어디까지 왔나',`<p>${esc(p.current)}</p>`)}
      ${section('내가 실제로 한 일',bullet(p.myWork))}
      ${section('문제와 발견',`<div class="problem-grid">${p.hardParts.map(x=>`<div class="problem-card"><strong>${esc(x.title)}</strong><p>${esc(x.text)}</p></div>`).join('')}</div>`)}
      ${section('설명의 범위',`<div class="claim-box">${esc(p.claim)}</div>`)}
      ${section('아직 남은 질문',bullet(p.openQuestions))}
      ${section('다음에 할 일',bullet(p.nextActions))}
      <details class="technical-details"><summary>배경과 기술 세부사항</summary>${section('먼저 알아둘 것',bullet(p.background))}${section('검증 근거',`<div class="metric-grid">${p.evidence.map(e=>`<div class="metric"><b>${esc(e.value)}</b><span>${esc(e.label)}</span><small>${esc(e.note)}</small></div>`).join('')}</div>`)}</details>
      ${section('관련 기록',`<div class="source-links">${sources}</div>`)}
    `;
    bindAction('#projectDetail [data-doc]',el=>openArchiveDoc(el.dataset.doc));
  }
  function renderTimeline() {
    $('#timelineList').innerHTML=D.timeline.map(x=>`<div class="time-row"><time>${esc(x.date)}</time><article class="time-body" data-p="${esc(x.project)}"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article></div>`).join('');
    projectButtons('#timelineList');
  }
  function renderDecisions() {
    const groups = new Map();
    D.recentChanges.forEach(x=>{if(!groups.has(x.date))groups.set(x.date,[]);groups.get(x.date).push(x);});
    $('#decisionList').innerHTML=[...groups].map(([date,items])=>`<section><h2 class="date-heading">${esc(date)}의 기록</h2>${items.map(x=>`<article class="decision"><h2>${esc(x.title)}</h2><p>${esc(x.text)}</p></article>`).join('')}</section>`).join('');
  }
  function renderEvidence() {
    $('#evidenceCards').innerHTML=D.evidence.map(x=>`<article class="evidence-card"><div class="proj">${esc(x.project)}</div><h3>${esc(x.event)}</h3><div class="before-after"><b>${esc(x.before)}</b><span>→</span><b>${esc(x.after)}</b></div><p>${esc(x.story)}</p></article>`).join('');
  }
  function renderSources() {
    $('#sourceSelect').innerHTML=records.map(x=>`<option value="${esc(x.path)}">${esc(x.path)}</option>`).join('');
    $('#repoList').innerHTML=D.repos.map(r=>`<a class="repo" href="${esc(r.url)}" target="_blank" rel="noreferrer"><strong>${esc(r.name)}</strong><span>${esc(r.role)}</span><small>${r.visibility==='private'?'비공개':'공개'}</small></a>`).join('');
    updateSyncCard();
  }
  function updateSyncCard() {
    const liveOk=!isPublic && !!live?.ok;
    const meta=liveOk?live:{commit:D.brainCommit,branch:D.branch,dirty:null};
    $('#syncCard').innerHTML=`<div class="sync-top"><div><div class="kicker">${liveOk?'로컬 원문 · 읽기 전용':isPublic?'공개용 데이터':'저장된 데이터'}</div><h2>${liveOk?'로컬 Brain과 연결되어 있습니다':isPublic?'공개 가능한 기록을 골랐습니다':'snapshot을 읽고 있습니다'}</h2></div><span class="status-badge ${liveOk?'live':''}">${liveOk?'연결됨':D.snapshot}</span></div><p>${liveOk?'현재 화면의 프로젝트 설명과 목록은 snapshot입니다. 문서는 로컬 작업 폴더를 우선 읽고, 없는 경로는 GitHub main에서 읽습니다. 원문 화면에서 버전을 선택할 수 있습니다. 파일과 Git working tree는 수정하지 않습니다.':isPublic?'이 묶음에는 공개 가능한 설명만 담았습니다. 개인 Brain의 로컬 원문을 읽지 않습니다.':'프로젝트 설명과 기록 목록은 data.js의 snapshot입니다. server.py에 로컬 Brain 경로를 지정하면 Git 상태와 원문을 읽을 수 있습니다.'}</p><div class="sync-facts"><div class="sync-fact"><b>${esc(meta.branch||'main')}</b><span>branch</span></div><div class="sync-fact"><b>${esc((meta.commit||'').slice(0,10))}</b><span>HEAD</span></div><div class="sync-fact"><b>${liveOk?(meta.dirty?'수정 사항 있음':'변경 없음'):'snapshot'}</b><span>working tree</span></div></div>`;
    $('#liveBadge').textContent=liveOk?'로컬 연결':isPublic?'Portfolio':`기록 ${D.snapshot}`;
    $('#liveBadge').classList.toggle('live',liveOk);
    $('.live-dot').classList.toggle('on',liveOk);
    $('#sideSync').textContent=liveOk?'로컬 Brain 연결':isPublic?'공개용 기록':'저장된 기록';
    $('#sideCommit').textContent=liveOk?(meta.commit||'').slice(0,8):D.snapshot;
    $('#liveNotice').innerHTML=`<strong>${esc(D.snapshot)} snapshot</strong> · ${liveOk?'로컬 원문 연결됨':'저장된 기록을 읽고 있습니다'}<button id="noticeSource">데이터 출처</button>`;
    $('#noticeSource').onclick=()=>show('sources');
    $('#sourceState').textContent=liveOk?'로컬 원문 · 읽기 전용':isPublic?'공개 설명만 포함':'저장한 원문 읽기';
  }
  async function checkLive() {
    if (isPublic || !/^https?:$/.test(location.protocol)) return;
    try {const r=await fetch('/api/status',{cache:'no-store'});if(!r.ok)throw Error();live=await r.json();} catch (_) { live=null; }
    updateSyncCard();await window.BrainReader.connect(live);
  }
  function openSource() { openArchiveDoc($('#sourceSelect').value); }
  function renderMap() {
    const positions=[
      {id:'root',label:'내 Brain',x:50,y:48,k:'root'},
      {id:'samsung',label:'삼성 DS',x:22,y:22,k:'memory'}, {id:'winter',label:'DRAM Controller',x:54,y:13,k:'memory'},
      {id:'career',label:'2027 취업',x:16,y:61,k:'career'}, {id:'canfd',label:'CAN-FD',x:79,y:24,k:'auto'}, {id:'amet',label:'AMET',x:87,y:51,k:'auto'},
      {id:'sharedbrain',label:'Shared Brain',x:52,y:78,k:'ai'}, {id:'investment',label:'Investment Brain',x:80,y:84,k:'ai'}, {id:'everytime',label:'Everytime',x:24,y:87,k:'ai'}
    ];
    const nodes=positions.filter(n=>n.id==='root'||D.projects.some(p=>p.id===n.id));
    const edges=D.connections.filter(([a,b])=>nodes.some(n=>n.id===a)&&nodes.some(n=>n.id===b));
    ['samsung','career','canfd','amet','sharedbrain'].forEach(id=>{if(nodes.some(n=>n.id===id))edges.push(['root',id]);});
    const colors={root:'#536453',memory:'#526d82',career:'#8a514c',auto:'#536f59',ai:'#746680'};
    const X=x=>x*11,Y=y=>y*6.8;
    $('#graph').innerHTML=edges.map(([a,b])=>{const A=nodes.find(n=>n.id===a),B=nodes.find(n=>n.id===b);return `<line class="edge" x1="${X(A.x)}" y1="${Y(A.y)}" x2="${X(B.x)}" y2="${Y(B.y)}"/>`;}).join('')+nodes.map(n=>`<g class="node" data-n="${n.id}" aria-label="${esc(n.label)} 연결 보기" transform="translate(${X(n.x)},${Y(n.y)})"><rect x="-110" y="-24" width="220" height="76" fill="transparent"/><circle r="${n.id==='root'?10:7}" fill="${colors[n.k]}" stroke="${colors[n.k]}"/><text text-anchor="middle" dy="36">${esc(n.label)}</text></g>`).join('');
    $('#mapMobileList').innerHTML=nodes.map(n=>`<button class="map-mobile-item" data-n="${n.id}">${esc(n.label)} <span>↗</span></button>`).join('');
    bindAction('[data-n]',el=>inspectNode(el.dataset.n));inspectNode('root');
  }
  function inspectNode(id) {
    if(id==='root'){$('#inspector').innerHTML=`<div class="kicker">연결해서 읽기</div><h2>${esc(D.profile.name)}의 Brain</h2><p>프로젝트를 따로 보지 않고, ‘실제 시스템에서 문제를 재현하고 어느 layer에서 기대 동작이 달라지는지 좁힌다’는 공통 축으로 연결합니다.</p>`;return;}
    const p=D.projects.find(x=>x.id===id);if(!p)return;
    const related=D.connections.filter(x=>x[0]===id||x[1]===id).map(x=>({p:D.projects.find(q=>q.id===(x[0]===id?x[1]:x[0])),why:x[2]})).filter(x=>x.p);
    $('#inspector').innerHTML=`<div class="kicker">${esc(p.domain)}</div><h2>${esc(p.title)}</h2><p>${esc(p.oneLine)}</p><div class="links"><button class="btn" id="nodeOpen">프로젝트 읽기 ↗</button></div>${related.length?`<div class="related-connections">${related.map(r=>`<div class="related-connection"><strong>${esc(r.p.title)}</strong><p>${esc(r.why)}</p></div>`).join('')}</div>`:''}`;
    $('#nodeOpen').onclick=()=>openProject(id);
  }
  function renderPortfolio() {
    const preset=$('#portfolioPreset').value||'all';
    let arr=D.projects.filter(p=>p.public&&p.featured);
    const presets={memory:['samsung'],ai:['sharedbrain','investment'],auto:['canfd','amet']};
    if(presets[preset])arr=arr.filter(p=>presets[preset].includes(p.id));
    $('#portfolioCases').innerHTML=arr.map((p,i)=>`<article class="portfolio-case"><div class="side"><span class="case-num">${String(i+1).padStart(2,'0')}</span>${esc(p.domain)}</div><div><h2>${esc(p.title)}</h2><p class="lead">${esc(p.oneLine)}</p><div class="portfolio-story"><div><h4>어떤 문제였나</h4><p>${esc(p.why)}</p></div><div><h4>내가 한 일</h4><p>${esc(p.myWork.slice(0,2).join(' '))}</p></div><div><h4>무엇으로 확인했나</h4><p>${p.evidence.map(e=>`${esc(e.value)} ${esc(e.label)}`).join(' · ')}</p></div></div><div class="portfolio-proof"><b>설명의 범위</b> · ${esc(p.claim)}</div><button class="section-link" data-p="${esc(p.id)}">전체 프로젝트 읽기 ↗</button></div></article>`).join('');
    projectButtons('#portfolioCases');
  }
  function searchIndex() {
    const a=[];
    D.projects.forEach(p=>a.push({title:p.title,type:'프로젝트',body:[p.oneLine,p.why,...p.myWork,...p.openQuestions].join(' '),go:()=>openProject(p.id)}));
    D.recentChanges.forEach(x=>a.push({title:x.title,type:'결정',body:x.text,go:()=>show('decisions')}));
    D.evidence.forEach(x=>a.push({title:x.event,type:'검증',body:x.story,go:()=>show('evidence')}));
    D.repos.forEach(x=>a.push({title:x.name,type:'저장소',body:x.role,go:()=>show('sources')}));
    D.courses.forEach(x=>a.push({title:x.name,type:'수업',body:x.story,go:()=>openArchiveDoc(x.link)}));
    D.programs.forEach(x=>a.push({title:x.name,type:'공부',body:x.story,go:()=>openArchiveDoc(x.link)}));
    D.activities.forEach(x=>a.push({title:x.title,type:'활동',body:x.summary,go:()=>x.project?openProject(x.project):show('activities')}));
    records.forEach(x=>a.push({title:x.title,type:x.category,body:x.path+' '+(x.searchText||''),go:()=>openArchiveDoc(x.path)}));
    return a;
  }
  function search(query) {
    const q=query.trim().toLowerCase();
    const results=searchIndex().filter(x=>!q||(x.title+' '+x.body).toLowerCase().includes(q)).slice(0,30);
    $('#commandResults').innerHTML=results.map((x,i)=>`<div class="search-result" data-i="${i}"><strong>${esc(x.title)}</strong><span>${esc(x.type)} · ${esc(x.body.slice(0,120))}</span></div>`).join('')||'<div class="search-result"><span>검색 결과가 없습니다.</span></div>';
    bindAction('[data-i]',el=>{const result=results[+el.dataset.i];closeCommand(false);result.go();});
  }
  function openCommand() {
    lastSearchFocus=document.activeElement;closeMenu();$('#command').hidden=false;$('#commandInput').value='';search('');$('#commandInput').focus();
  }
  function closeCommand(restore=true) { $('#command').hidden=true;if(restore)lastSearchFocus?.focus(); }

  function updateCatalog(documents, origin) {
    if (!documents.length) return;
    catalogOrigin=origin;
    const existing=new Map(D.archive.map(x=>[x.path,x]));
    const categories={'academics':'공부','projects':'프로젝트','memory':'기억과 근거','knowledge':'기술 노트','career':'진로','private':'개인 기록','recruiting':'채용','schemas':'데이터 구조'};
    records=documents.filter(x=>x.path.startsWith('brain/')).map(x=>({...x,category:existing.get(x.path)?.category||categories[x.path.split('/')[1]]||'Brain Core',title:existing.get(x.path)?.title||x.title}));
    const category=$('#archiveCategory').value;
    $('#archiveCategory').innerHTML='';renderArchive();
    if([...$('#archiveCategory').options].some(o=>o.value===category)){$('#archiveCategory').value=category;renderArchive();}
    const selected=$('#sourceSelect').value;
    $('#sourceSelect').innerHTML=documents.map(x=>`<option value="${esc(x.path)}">${esc(existing.get(x.path)?.title||x.title)} · ${esc(x.path)}</option>`).join('');
    if([...$('#sourceSelect').options].some(o=>o.value===selected))$('#sourceSelect').value=selected;
    $('#archiveCountHome').textContent=records.length+'개의 기록';
  }
  function init() {
    setTheme();renderHome();renderActivities();renderLearning();renderProjects();renderTimeline();renderDecisions();renderEvidence();renderSources();renderArchive();renderMap();renderPortfolio();
    window.BrainReader.init({show,openProject,onCatalog:updateCatalog,onBookmarks:()=>renderArchive(true)});
    route();checkLive();
    $$('#nav button').forEach(b=>b.onclick=()=>show(b.dataset.page));
    $$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
    $('#projectBack').onclick=()=>show('projects');
    $('#menuBtn').onclick=()=>{const open=!$('#sidebar').classList.contains('open');$('#sidebar').classList.toggle('open',open);$('#navShade').hidden=!open;$('#menuBtn').setAttribute('aria-expanded',String(open));};
    $('#navShade').onclick=closeMenu;
    const mobileQuery=matchMedia('(max-width: 790px)');
    const updateArchiveTopics=()=>{$('#archiveTopics').open=!mobileQuery.matches;};
    updateArchiveTopics();mobileQuery.addEventListener('change',updateArchiveTopics);
    $('#themeBtn').onclick=()=>{theme=theme==='dark'?'light':'dark';setTheme();};
    $('#searchBtn').onclick=openCommand;$('#commandClose').onclick=()=>closeCommand();
    $('#command').onclick=e=>{if(e.target===$('#command'))closeCommand();};
    $('#commandInput').oninput=e=>search(e.target.value);
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommand();}
      if(e.key==='Escape'){closeMenu();if(!$('#command').hidden)closeCommand();}
      if(e.key==='Tab'&&!$('#command').hidden){
        const focusable=[...$('#command').querySelectorAll('input,button,[tabindex="0"]')],first=focusable[0],last=focusable.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
    $('#sourceOpen').onclick=openSource;
    $('#portfolioPreset').onchange=renderPortfolio;$('#printBtn').onclick=()=>print();
    $('#archiveSort').onchange=()=>renderArchive(true);
    $('#archiveBookmarks').onclick=()=>{bookmarkOnly=!bookmarkOnly;$('#archiveBookmarks').setAttribute('aria-pressed',String(bookmarkOnly));renderArchive(true);};
    $('#catalogRefresh').onclick=async()=>{const b=$('#catalogRefresh');b.disabled=true;b.textContent='새로고침 중…';try{await checkLive();await window.BrainReader.connect(live,true);}finally{b.disabled=false;b.textContent='목록 새로고침';}};
    $('#archiveSearch').oninput=()=>renderArchive(true);$('#archiveCategory').onchange=()=>renderArchive(true);
    $('#archiveRandom').onclick=()=>{const x=records[Math.floor(Math.random()*records.length)];if(x)openArchiveDoc(x.path);};
    window.addEventListener('hashchange',route);
    window.addEventListener('resize',()=>{if(innerWidth>790)closeMenu();});
  }
  init();
})();
