(() => {
  'use strict';

  /* ===== STATE ===== */
  let currentSection = 'home';
  let selectedProvince = null;
  let selectedPolicy = null;
  let compareMode = false;
  let compareProvince = null;
  let aiOpen = false;
  let activeTag = 'all';
  const likedItems = new Set();

  /* ===== DATA ===== */
  const policyData = [
    {
      id: 'p1', year: '2024', org: '国务院办公厅',
      title: '关于推进跨境电子商务高质量发展的指导意见',
      tags: ['跨境电商', '高质量发展', '综试区'],
      summary: '围绕跨境电商综试区建设、海外仓布局、通关便利化、品牌培育和监管优化提出系统安排。',
      highlights: ['推动跨境电商综试区提档升级', '优化海关、税务、外汇等协同监管', '支持海外仓与国际物流网络建设'],
      url: 'https://www.gov.cn/zhengce/',
      content: '该政策强调以制度创新和监管创新推动跨境电商高质量发展，突出便利化、规范化与国际化协同。'
    },
    {
      id: 'p2', year: '2023', org: '商务部等部门',
      title: '关于拓展跨境电商出口推进海外仓建设的意见',
      tags: ['海外仓', '出口协同', '服务网络'],
      summary: '聚焦企业出海链路，完善海外仓、物流、金融和服务生态，提升国际履约能力。',
      highlights: ['鼓励海外仓数字化升级', '提升出口履约与退换货能力', '强化跨部门服务支撑'],
      url: 'https://www.mofcom.gov.cn/',
      content: '政策重点解决跨境电商出口中的仓储、配送、售后与本地化运营难题。'
    },
    {
      id: 'p3', year: '2022', org: '海关总署等',
      title: '关于完善跨境电商零售进口监管有关工作的通知',
      tags: ['零售进口', '监管规则', '合规'],
      summary: '明确跨境零售进口商品监管要求、清单管理和通关流程，提升风险防控能力。',
      highlights: ['完善清单管理与申报要求', '加强商品质量与安全监管', '提升通关规则透明度'],
      url: 'https://www.customs.gov.cn/',
      content: '政策着重在规则统一、流程清晰和风险识别，为企业提供更稳定的进口业务环境。'
    },
    {
      id: 'p4', year: '2022', org: '国家互联网信息办公室',
      title: '数据出境安全评估办法',
      tags: ['数据出境', '安全评估', '跨境数据治理'],
      summary: '针对重要数据和个人信息出境场景建立安全评估制度，是跨境治理的重要基础规则。',
      highlights: ['建立出境前安全评估机制', '强调数据最小必要原则', '强化企业主体责任'],
      url: 'https://www.cac.gov.cn/',
      content: '对于跨境电商平台、服务商和生态企业而言，该政策直接关系数据跨境流动与合规体系建设。'
    },
    {
      id: 'p5', year: '2023', org: '国务院办公厅',
      title: '促进外贸稳定规模优化结构若干政策措施',
      tags: ['外贸结构', '稳规模', '综合服务'],
      summary: '从融资、通关、物流、平台和市场拓展等方面支持外贸新业态发展。',
      highlights: ['支持外贸新业态和数字平台发展', '强化金融与通关配套支持', '优化区域协同与服务体系'],
      url: 'https://www.gov.cn/zhengce/',
      content: '政策将跨境电商放在外贸新动能的重要位置，强调多部门联动与服务升级。'
    }
  ];

  let discussions = [
    { id: 'd1', company: '粤港跨境科技', topic: '跨境数据申报协同', content: '我们在珠三角业务中最关注多部门接口标准不统一的问题，建议建立统一字段模板和校验规范。', time: '2小时前', likes: 18 },
    { id: 'd2', company: '长三角品牌出海联盟', topic: '海外仓与退换货规则', content: '企业更需要明确海外仓库存监管与退换货闭环规则，尤其是平台、仓储和海关之间的数据联动。', time: '今天', likes: 12 },
    { id: 'd3', company: '中西部综试区服务中心', topic: '地方政策落地差异', content: '同类政策在不同城市执行尺度不同，建议形成可对比的政策执行清单与反馈机制。', time: '昨天', likes: 9 }
  ];

  const quickPrompts = [
    '跨境数据治理相关政策有哪些？',
    '广东治理优势是什么？',
    '综合能力排名前三的省份？',
    '海外仓建设对应哪些政策？',
    '企业讨论中最集中的问题？'
  ];

  const hotTopics = [
    '跨境数据申报标准统一', '海外仓监管与退换货', '地方政策落地差异',
    '通关便利化新政解读', '跨境平台合规审查', '综试区扩围机会'
  ];

  /* ===== INIT ===== */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    bindNav();
    bindButtons();
    initAIChat();
    renderHeroStats();
    renderPlatformStats();
    renderRankings();
    renderJourneySteps();
    renderInsights();
    renderGovSteps();
    renderProvinceWelcome();
    renderPolicyOverview();
    buildPolicyTags();
    renderPolicyList();
    renderPolicyDetail(policyData[0]);
    renderDiscussionFeed();
    renderHotTopics();
    loadChinaMap();
  }

  /* ===== NAV ===== */
  function bindNav() {
    document.querySelectorAll('.nav-btn').forEach(btn =>
      btn.addEventListener('click', () => showSection(btn.dataset.section))
    );
    document.querySelectorAll('[data-jump]').forEach(btn =>
      btn.addEventListener('click', () => showSection(btn.dataset.jump))
    );
    document.getElementById('ai-nav-btn').addEventListener('click', toggleAIChat);
  }

  function showSection(s) {
    currentSection = s;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === s));
    document.querySelectorAll('.content-section').forEach(el => el.classList.toggle('active', el.id === `${s}-section`));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (s === 'map') setTimeout(loadChinaMap, 50);
  }

  function bindButtons() {
    document.getElementById('province-search-btn').addEventListener('click', searchProvince);
    document.getElementById('province-search-input').addEventListener('keydown', e => { if (e.key === 'Enter') searchProvince(); });
    document.getElementById('discussion-submit').addEventListener('click', submitDiscussion);
  }

  /* ===== HOME ===== */
  function renderHeroStats() {
    const top = [...chinaData].sort((a, b) => b.total - a.total);
    const avg = (chinaData.reduce((s, p) => s + p.total, 0) / chinaData.length).toFixed(1);
    const items = [
      { v: chinaData.length + '+', l: '省域治理样本' },
      { v: avg, l: '平均综合得分' },
      { v: policyData.length, l: '重点政策收录' },
      { v: top[0].name, l: '最高评级省份' }
    ];
    document.getElementById('hero-stats').innerHTML = items.map(s =>
      `<div class="hero-stat-card"><strong>${s.v}</strong><span>${s.l}</span></div>`
    ).join('');
  }

  function renderPlatformStats() {
    const excellent = chinaData.filter(p => p.total >= 80).length;
    const good = chinaData.filter(p => p.total >= 70 && p.total < 80).length;
    const items = [
      { v: chinaData.length, l: '收录省份' },
      { v: policyData.length, l: '重点政策' },
      { v: excellent, l: '优秀评级' },
      { v: discussions.length + '+', l: '讨论话题' }
    ];
    document.getElementById('platform-stats').innerHTML = items.map(s =>
      `<div class="pstat-card"><strong>${s.v}</strong><span>${s.l}</span></div>`
    ).join('');
  }

  function renderRankings() {
    const top10 = [...chinaData].sort((a, b) => b.total - a.total).slice(0, 10);
    document.getElementById('rankings-list').innerHTML = top10.map((p, i) => {
      const lvl = getProvinceLevel(p.total);
      const pct = p.total.toFixed(1);
      return `<div class="ranking-item" onclick="goToProvince('${p.name}')">
        <div class="rank-num ${i < 3 ? 'top3' : ''}">${i + 1}</div>
        <div class="rank-info">
          <div class="rank-name">${p.name}</div>
          <div class="rank-bar-track">
            <div class="rank-bar-fill" style="width:${p.total}%;background:${lvl.color}"></div>
          </div>
        </div>
        <div class="rank-score" style="color:${lvl.color}">${pct}</div>
      </div>`;
    }).join('');
  }

  function renderJourneySteps() {
    const steps = [
      ['省域感知', '通过中国地图直观看到治理能力梯度与评级分布。'],
      ['问题识别', '从数字政府、开放度、透明度等维度诊断地区短板。'],
      ['政策理解', '浏览跨境治理政策总览并进入具体政策原文。'],
      ['企业反馈', '汇聚企业讨论，形成实务问题池与热点话题。'],
      ['AI 协同', '快速检索政策、地区、讨论与优化建议。']
    ];
    document.getElementById('journey-steps').innerHTML = steps.map(([k, v]) =>
      `<div class="journey-step"><strong>${k}：</strong>${v}</div>`
    ).join('');
  }

  function renderInsights() {
    const items = [
      ['图', '可视化更聚焦', '强化地图、政策与 AI 入口联动，核心功能一眼可见。'],
      ['策', '信息密度合理', '将复杂治理流程拆解为卡片、指标和路径，减轻阅读压力。'],
      ['智', '交互入口明确', '通过按钮、悬浮助手和卡片，把用户直接引导到关键操作。']
    ];
    document.getElementById('insights-list').innerHTML = items.map(([ico, t, d]) =>
      `<div class="insight-item">
        <div class="insight-ico">${ico}</div>
        <div><h3>${t}</h3><p>${d}</p></div>
      </div>`
    ).join('');
  }

  function renderGovSteps() {
    const steps = [
      ['STEP 1', '区域识别', '从地图点击目标省份，查看治理评分与问题画像。'],
      ['STEP 2', '政策匹配', '快速定位相关政策，理解制度支撑与规则边界。'],
      ['STEP 3', '企业反馈', '结合真实讨论议题，识别执行层面难点与差异。'],
      ['STEP 4', 'AI 提问', '围绕地区、政策或问题继续追问，形成治理建议。']
    ];
    document.getElementById('gov-steps').innerHTML = steps.map(([label, title, desc]) =>
      `<div class="gov-step">
        <div class="step-label">${label}</div>
        <strong>${title}</strong>
        <p>${desc}</p>
      </div>`
    ).join('');
  }

  /* ===== MAP ===== */
  function renderProvinceWelcome() {
    const sorted = [...chinaData].sort((a, b) => b.total - a.total).slice(0, 5);
    document.getElementById('province-detail-panel').innerHTML = `
      <div class="welcome-card">
        <h3>中国省域治理能力</h3>
        <p>地图支持交互点击。点击任意省份即可查看综合得分、治理问题与优化建议。点击"对比分析"可并排比较两省。</p>
        <div class="top-list">
          ${sorted.map((p, i) => {
            const lvl = getProvinceLevel(p.total);
            return `<div class="top-item" onclick="goToMapProvince('${p.name}')">
              <strong>TOP ${i + 1} · ${p.name}</strong> &nbsp; 综合得分 ${p.total.toFixed(1)}，评级 <span style="color:${lvl.color}">${lvl.level}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function renderProvinceDetail(p) {
    selectedProvince = p;
    const lvl = getProvinceLevel(p.total);
    const badgeStyle = `background:${lvl.color}16;color:${lvl.color};border:1px solid ${lvl.color}40`;
    const metrics = [
      { label: '网民规模', val: p.internetUsers },
      { label: '宽带用户', val: p.broadband },
      { label: '移动电话', val: p.mobile },
      { label: '数字政府', val: p.digitalGov },
      { label: '数据开放', val: p.openness },
      { label: '政务透明', val: p.transparency }
    ];
    const maxVal = 100;
    const metricColors = ['var(--blue)', 'var(--jade)', 'var(--purple)', 'var(--gold)', 'var(--orange)', 'var(--jade-l)'];

    document.getElementById('province-detail-panel').innerHTML = `
      <div class="province-card">
        <div class="score-badge" style="${badgeStyle}">${lvl.level}</div>
        <h3>${p.name}</h3>
        <div class="score-num">${p.total.toFixed(1)}</div>
        <div class="score-sub">省域跨境治理综合评分</div>
        <div class="metric-bars">
          ${metrics.map((m, i) => `
            <div class="metric-row">
              <div class="metric-label">${m.label}</div>
              <div class="metric-track"><div class="metric-fill" style="width:${Math.min(m.val, 100)}%;background:${metricColors[i]}"></div></div>
              <div class="metric-val">${m.val.toFixed(1)}</div>
            </div>`).join('')}
        </div>
        <div class="probs">
          ${p.problems.slice(0, 3).map(x => `<div class="prob-item">⚠ ${x}</div>`).join('')}
        </div>
        <div class="advs">
          ${p.solutions.slice(0, 3).map(x => `<div class="adv-item">✓ ${x}</div>`).join('')}
        </div>
        <button class="compare-trigger" onclick="startCompare('${p.name}')">对比分析 →</button>
      </div>`;
  }

  function searchProvince() {
    const q = document.getElementById('province-search-input').value.trim();
    const p = chinaData.find(x => x.name.includes(q));
    if (p) { showSection('map'); setTimeout(() => { renderProvinceDetail(p); highlightProvince(p.name); }, 60); }
    else alert('未找到对应省份，请重新输入。');
  }

  function highlightProvince(name) {
    d3.selectAll('.province-path').each(function(d) {
      const p = getProvinceByNameOrCode(getFeatureName(d), getFeatureCode(d));
      if (p && p.name === name) {
        d3.selectAll('.province-path').classed('selected', false).attr('stroke', 'rgba(255,255,255,.7)').attr('stroke-width', .6);
        d3.select(this).classed('selected', true).attr('stroke', '#c9963e').attr('stroke-width', 2);
      }
    });
  }

  /* Compare */
  window.startCompare = function(name) {
    const p = chinaData.find(x => x.name === name);
    if (!p) return;
    compareMode = true;
    compareProvince = p;
    const panel = document.getElementById('province-detail-panel');
    const existing = panel.querySelector('.compare-mode-note');
    if (!existing) {
      const note = document.createElement('div');
      note.className = 'compare-mode-note';
      note.textContent = '请在地图上点击另一省份进行对比分析';
      panel.querySelector('.province-card').appendChild(note);
    }
  };

  window.closeCompare = function() {
    compareMode = false; compareProvince = null;
    document.getElementById('compare-panel').style.display = 'none';
  };

  function doCompare(p2) {
    const p1 = compareProvince;
    const panel = document.getElementById('compare-panel');
    panel.style.display = 'block';
    const metrics = [
      { label: '网民规模', k: 'internetUsers' },
      { label: '宽带用户', k: 'broadband' },
      { label: '移动电话', k: 'mobile' },
      { label: '数字政府', k: 'digitalGov' },
      { label: '数据开放', k: 'openness' },
      { label: '政务透明', k: 'transparency' }
    ];
    const renderCol = (p, color) => `
      <div class="cmp-col">
        <div class="cmp-name">${p.name}</div>
        <div class="cmp-score" style="color:${getProvinceLevel(p.total).color}">${p.total.toFixed(1)}</div>
        <div class="cmp-bar-row">
          ${metrics.map(m => `
            <div class="cmp-row">
              <div class="cmp-label">${m.label}</div>
              <div class="cmp-track"><div class="cmp-fill" style="width:${p[m.k]}%;background:${color}"></div></div>
              <div class="cmp-val">${p[m.k].toFixed(1)}</div>
            </div>`).join('')}
        </div>
      </div>`;
    document.getElementById('compare-body').innerHTML =
      renderCol(p1, 'var(--jade)') + renderCol(p2, 'var(--blue)');
    compareMode = false;
    compareProvince = null;
  }

  /* ===== POLICY ===== */
  function renderPolicyOverview() {
    document.getElementById('policy-overview-text').textContent =
      '跨境治理政策体系主要覆盖跨境电商高质量发展、海外仓建设、零售进口监管、跨境数据安全与外贸结构优化等方向。整体呈现"贸易便利化 + 数字监管 + 数据安全 + 平台协同"的政策组合逻辑，既强调促进发展，也强调合规治理与风险防控。';
  }

  function buildPolicyTags() {
    const allTags = [...new Set(policyData.flatMap(p => p.tags))];
    const row = document.getElementById('policy-tag-row');
    allTags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'tag-btn'; btn.dataset.tag = tag; btn.textContent = tag;
      btn.addEventListener('click', () => filterPolicy(tag));
      row.appendChild(btn);
    });
    row.querySelector('[data-tag="all"]').addEventListener('click', () => filterPolicy('all'));
  }

  function filterPolicy(tag) {
    activeTag = tag;
    document.querySelectorAll('.tag-btn').forEach(b => b.classList.toggle('active', b.dataset.tag === tag));
    renderPolicyList();
  }

  function renderPolicyList() {
    const filtered = activeTag === 'all' ? policyData : policyData.filter(p => p.tags.includes(activeTag));
    document.getElementById('policy-list').innerHTML = filtered.map(p => `
      <button class="policy-item ${selectedPolicy && selectedPolicy.id === p.id ? 'active' : ''}" data-id="${p.id}">
        <h4>${p.title}</h4>
        <div class="policy-meta">${p.org} · ${p.year}</div>
        <div class="pol-tags">${p.tags.map(t => `<span class="pol-tag">${t}</span>`).join('')}</div>
        <div class="policy-meta" style="margin-top:6px">${p.summary}</div>
      </button>`).join('');
    document.querySelectorAll('.policy-item').forEach(btn =>
      btn.addEventListener('click', () => {
        const p = policyData.find(x => x.id === btn.dataset.id);
        selectedPolicy = p; renderPolicyDetail(p); renderPolicyList();
      })
    );
  }

  function renderPolicyDetail(p) {
    selectedPolicy = p;
    document.getElementById('policy-detail-panel').innerHTML = `
      <div class="pol-detail" style="padding:8px">
        <h3>${p.title}</h3>
        <div class="pol-meta-row">发布机构：${p.org} &nbsp;·&nbsp; 发布年份：${p.year}</div>
        <p>${p.content}</p>
        <div class="pol-highlights">
          ${p.highlights.map(x => `<div class="pol-hl">✓ ${x}</div>`).join('')}
        </div>
        <a class="pol-link" href="${p.url}" target="_blank" rel="noreferrer">点击查看政策原文 →</a>
      </div>`;
  }

  /* ===== DISCUSSION ===== */
  function renderDiscussionFeed() {
    document.getElementById('discussion-feed').innerHTML = discussions.map(d => `
      <div class="disc-item">
        <div class="disc-item-head">
          <div>
            <h4>${d.topic}</h4>
            <div class="disc-meta">${d.company} · ${d.time}</div>
          </div>
        </div>
        <p>${d.content}</p>
        <div class="disc-footer">
          <button class="like-btn ${likedItems.has(d.id) ? 'liked' : ''}" onclick="toggleLike('${d.id}')">
            <span class="heart">${likedItems.has(d.id) ? '♥' : '♡'}</span>
            <span>${likedItems.has(d.id) ? d.likes + 1 : d.likes}</span>
          </button>
          <span class="disc-time">${d.time}</span>
        </div>
      </div>`).join('');
  }

  window.toggleLike = function(id) {
    if (likedItems.has(id)) likedItems.delete(id);
    else likedItems.add(id);
    renderDiscussionFeed();
  };

  function renderHotTopics() {
    const clsMap = ['h1', 'h2', 'h3'];
    document.getElementById('hot-topics').innerHTML = hotTopics.map((t, i) => `
      <div class="hot-item" onclick="fillTopic('${t}')">
        <span class="hot-no ${clsMap[i] || ''}">${i + 1}</span>
        <span class="hot-text">${t}</span>
      </div>`).join('');
  }

  window.fillTopic = function(t) {
    document.getElementById('discussion-topic').value = t;
    document.getElementById('discussion-content').focus();
  };

  function submitDiscussion() {
    const company = v('discussion-company'), topic = v('discussion-topic'), content = v('discussion-content');
    const tip = document.getElementById('discussion-tip');
    if (!company || !topic || !content) { tip.textContent = '请完整填写企业、主题和内容。'; return; }
    const id = 'u' + Date.now();
    discussions.unshift({ id, company, topic, content, time: '刚刚', likes: 0 });
    renderDiscussionFeed();
    ['discussion-company', 'discussion-topic', 'discussion-content'].forEach(x => document.getElementById(x).value = '');
    tip.textContent = '讨论已发布！';
    setTimeout(() => { tip.textContent = ''; }, 3000);
  }

  /* ===== FLOATING AI ===== */
  function initAIChat() {
    document.getElementById('ai-fab').addEventListener('click', toggleAIChat);
    document.getElementById('ai-close').addEventListener('click', closeAIChat);
    document.getElementById('ai-send').addEventListener('click', sendAIMessage);
    document.getElementById('ai-input').addEventListener('keydown', e => { if (e.key === 'Enter') sendAIMessage(); });

    addAIMessage('bot', '你好，我是跨境治理 AI 助手 ✦\n\n可以问我政策、地区能力、企业讨论热点，或让我帮你查找相关内容。');
    renderAIQuick();
  }

  function renderAIQuick() {
    document.getElementById('ai-quick').innerHTML = quickPrompts.map(q =>
      `<button class="ai-quick-btn" onclick="askQuick('${q}')">${q}</button>`
    ).join('');
  }

  function toggleAIChat() {
    aiOpen = !aiOpen;
    document.getElementById('ai-panel').classList.toggle('open', aiOpen);
    document.getElementById('ai-fab').classList.toggle('is-open', aiOpen);
  }

  function closeAIChat() {
    aiOpen = false;
    document.getElementById('ai-panel').classList.remove('open');
    document.getElementById('ai-fab').classList.remove('is-open');
  }

  window.askQuick = function(q) {
    document.getElementById('ai-input').value = q;
    sendAIMessage();
  };

  function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const q = input.value.trim();
    if (!q) return;
    addAIMessage('user', q);
    input.value = '';
    const tid = 'typing_' + Date.now();
    addTypingIndicator(tid);
    setTimeout(() => {
      removeTypingIndicator(tid);
      addAIMessage('bot', answerQuestion(q));
    }, 700 + Math.random() * 500);
  }

  function addAIMessage(role, text) {
    const box = document.getElementById('ai-messages');
    const wrap = document.createElement('div');
    wrap.className = `ai-msg ${role === 'user' ? 'user' : ''}`;
    wrap.innerHTML = `
      <div class="ai-msg-label">${role === 'user' ? '你' : 'AI 助手'}</div>
      <div class="ai-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
  }

  function addTypingIndicator(id) {
    const box = document.getElementById('ai-messages');
    const wrap = document.createElement('div');
    wrap.className = 'ai-msg'; wrap.id = id;
    wrap.innerHTML = `<div class="ai-msg-label">AI 助手</div>
      <div class="ai-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function answerQuestion(q) {
    const s = q.toLowerCase();
    const province = chinaData.find(p => s.includes(p.name) || q.includes(p.name));
    if (province) {
      const lvl = getProvinceLevel(province.total);
      return `${province.name}综合得分 ${province.total.toFixed(1)}，评级「${lvl.level}」。\n\n数字政府 ${province.digitalGov.toFixed(1)}，数据开放 ${province.openness.toFixed(1)}，政务透明 ${province.transparency.toFixed(1)}。\n\n主要短板：${province.problems.slice(0, 2).join('；')}。`;
    }
    const policy = policyData.find(p => q.includes(p.title.slice(0, 8)) || p.tags.some(t => q.includes(t)));
    if (policy) {
      return `推荐查看《${policy.title}》。\n\n${policy.org} · ${policy.year}年发布，核心内容包括：\n${policy.highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\n右侧政策界面可直接点开查看原文。`;
    }
    if (s.includes('政策') || s.includes('数据') || s.includes('治理'))
      return '跨境治理政策主要分为五类：\n1. 跨境电商高质量发展\n2. 海外仓与物流建设\n3. 零售进口监管\n4. 数据出境安全\n5. 外贸稳规模与结构优化\n\n可进一步说明想查哪一类。';
    if (s.includes('讨论') || s.includes('企业'))
      return `当前企业讨论中较集中的主题有：\n${discussions.slice(0, 3).map(d => `· ${d.topic}`).join('\n')}\n\n主要聚焦数据接口统一、海外仓协同和地方政策执行差异。`;
    const top3 = [...chinaData].sort((a, b) => b.total - a.total).slice(0, 3).map(p => `${p.name}(${p.total.toFixed(1)})`).join('、');
    return `我可以帮你查询政策、省份治理能力和企业讨论内容。\n\n当前综合能力较强的省份：${top3}。\n\n你可以按"省份名称""政策主题"或"企业问题关键词"继续提问。`;
  }

  /* ===== D3 MAP ===== */
  function loadChinaMap() {
    const c = document.getElementById('china-map-svg');
    if (!c || !window.CHINA_PROVINCES_GEOJSON) return;
    const existingSvg = c.querySelector('svg');
    if (existingSvg) return;
    const w = c.clientWidth || 860, h = c.clientHeight || 600;
    const svg = d3.select(c).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', `0 0 ${w} ${h}`);

    // Subtle grid
    const defs = svg.append('defs');
    const pat = defs.append('pattern').attr('id', 'grid').attr('width', 28).attr('height', 28).attr('patternUnits', 'userSpaceOnUse');
    pat.append('circle').attr('cx', 1).attr('cy', 1).attr('r', .8).attr('fill', 'rgba(100,140,130,.2)');
    svg.append('rect').attr('width', w).attr('height', h).attr('fill', '#f8f4ed');
    svg.append('rect').attr('width', w).attr('height', h).attr('fill', 'url(#grid)');

    const g = svg.append('g');
    const tooltip = d3.select(c).append('div').attr('class', 'map-tooltip');
    const geo = toProvinceLevelGeo(normalizeGeoJSON(window.CHINA_PROVINCES_GEOJSON));
    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection);
    projection.fitExtent([[20, 20], [w - 20, h - 20]], geo);

    g.selectAll('path').data(geo.features).enter().append('path')
      .attr('class', 'province-path')
      .attr('d', path)
      .attr('fill', d => {
        const p = getProvinceByNameOrCode(getFeatureName(d), getFeatureCode(d));
        return p ? getProvinceLevel(p.total).color + 'cc' : '#c8d8d2';
      })
      .attr('stroke', 'rgba(255,255,255,.7)').attr('stroke-width', .6)
      .style('cursor', d => getProvinceByNameOrCode(getFeatureName(d), getFeatureCode(d)) ? 'pointer' : 'default')
      .on('mouseover', function(e, d) {
        const p = getProvinceByNameOrCode(getFeatureName(d), getFeatureCode(d));
        if (!p) return;
        d3.select(this).attr('stroke', 'rgba(255,255,255,.95)').attr('stroke-width', 1.5);
        const lvl = getProvinceLevel(p.total);
        tooltip.style('display', 'block').html(
          `<strong>${p.name}</strong>
           <span>综合得分：${p.total.toFixed(1)} · <span style="color:${lvl.color}">${lvl.level}</span></span>
           <span>数字政府 ${p.digitalGov.toFixed(1)} · 开放度 ${p.openness.toFixed(1)}</span>`
        );
      })
      .on('mousemove', e => {
        const [x, y] = d3.pointer(e, c);
        tooltip.style('left', `${x + 14}px`).style('top', `${y - 46}px`);
      })
      .on('mouseout', function(e, d) {
        const isSelected = d3.select(this).classed('selected');
        if (!isSelected) d3.select(this).attr('stroke', 'rgba(255,255,255,.7)').attr('stroke-width', .6);
        tooltip.style('display', 'none');
      })
      .on('click', function(e, d) {
        const p = getProvinceByNameOrCode(getFeatureName(d), getFeatureCode(d));
        if (!p) return;
        if (compareMode && compareProvince) {
          doCompare(p);
          g.selectAll('.province-path').attr('stroke', 'rgba(255,255,255,.7)').attr('stroke-width', .6).classed('selected', false);
          d3.select(this).attr('stroke', '#c9963e').attr('stroke-width', 2).classed('selected', true);
          return;
        }
        g.selectAll('.province-path').attr('stroke', 'rgba(255,255,255,.7)').attr('stroke-width', .6).classed('selected', false);
        d3.select(this).attr('stroke', '#c9963e').attr('stroke-width', 2).classed('selected', true);
        renderProvinceDetail(p);
        showSection('map');
      });

    // Labels
    g.selectAll('text').data(geo.features).enter().append('text')
      .attr('transform', d => `translate(${path.centroid(d)})`)
      .attr('text-anchor', 'middle').attr('font-size', '8.5px')
      .attr('fill', 'rgba(28,44,48,.7)').style('pointer-events', 'none')
      .text(d => {
        const p = getProvinceByNameOrCode(getFeatureName(d), getFeatureCode(d));
        const name = (p ? p.name : getFeatureName(d)).replace(/省|市|自治区|壮族|回族|维吾尔|特别行政区/g, '');
        return name.length <= 3 ? name : name.slice(0, 3);
      });

    drawSouthChinaSeaInset(g, path, geo, w, h);
  }

  function normalizeGeoJSON(i) {
    if (i && i.type === 'FeatureCollection') return i;
    return i && i.features ? { type: 'FeatureCollection', features: i.features } : null;
  }

  function toProvinceLevelGeo(fc) {
    const fs = (fc && fc.features) || [];
    return { type: 'FeatureCollection', features: fs.filter(f => { const id = String((f.properties && (f.properties.adcode || f.properties.id)) || ''); return !id || id.length < 6 || id.endsWith('0000'); }) };
  }

  function getFeatureName(d) { const p = d.properties || {}; return String(p.name || p.NAME || p.fullname || ''); }
  function getFeatureCode(d) { const p = d.properties || {}; return p.adcode || p.id || p.code || null; }

  function drawSouthChinaSeaInset(g, path, geo, w, h) {
    const bounds = path.bounds(geo);
    const boxW = Math.max(88, Math.min(120, w * .14)), boxH = Math.max(134, Math.min(180, h * .25));
    const x = bounds[1][0] - boxW * 1.02, y = bounds[1][1] - boxH * .92;
    const inset = g.append('g').attr('transform', `translate(${x},${y})`);
    inset.append('rect').attr('width', boxW).attr('height', boxH).attr('rx', 8).attr('fill', 'rgba(252,249,244,.95)').attr('stroke', '#c2cec8').attr('stroke-width', 1);
    inset.append('image').attr('href', './nanhai-inset.png').attr('x', 4).attr('y', 4).attr('width', boxW - 8).attr('height', boxH - 8).attr('preserveAspectRatio', 'xMidYMid meet');
    inset.append('text').attr('x', boxW / 2).attr('y', boxH - 7).attr('text-anchor', 'middle').attr('font-size', '7.5px').attr('fill', '#6d7c80').text('南海诸岛');
  }

  function getProvinceByNameOrCode(name, adcode) {
    if (adcode && provinceCodeMap[+adcode]) return provinceCodeMap[+adcode];
    const clean = String(name || '').replace(/省|市|自治区|壮族|回族|维吾尔|特别行政区/g, '');
    for (const k of Object.keys(provinceNameMap)) { if (clean === k || clean.includes(k) || k.includes(clean)) return provinceCodeMap[provinceNameMap[k]]; }
    const aliases = { InnerMongolia: '内蒙古', NeiMongol: '内蒙古', Hongkong: '香港', Macau: '澳门', Taiwan: '台湾', Xizang: '西藏', Xinjiang: '新疆', Ningxia: '宁夏', Guangxi: '广西', Qinghai: '青海', Shaanxi: '陕西', Chongqing: '重庆', Heilongjiang: '黑龙江', Jiangxi: '江西', Hubei: '湖北', Hunan: '湖南', Guangdong: '广东', Beijing: '北京', Shanghai: '上海', Tianjin: '天津', Hebei: '河北', Shanxi: '山西', Liaoning: '辽宁', Jilin: '吉林', Shandong: '山东', Henan: '河南', Jiangsu: '江苏', Zhejiang: '浙江', Fujian: '福建', Hainan: '海南', Sichuan: '四川', Guizhou: '贵州', Yunnan: '云南', Gansu: '甘肃' };
    const mapped = aliases[clean] || aliases[clean.replace(/\s+/g, '')];
    if (mapped && provinceNameMap[mapped]) return provinceCodeMap[provinceNameMap[mapped]];
    return null;
  }

  /* ===== WINDOW EXPORTS ===== */
  window.goToProvince = function(name) { showSection('map'); setTimeout(() => { const p = chinaData.find(x => x.name === name); if (p) { renderProvinceDetail(p); highlightProvince(name); } }, 80); };
  window.goToMapProvince = function(name) { const p = chinaData.find(x => x.name === name); if (p) { renderProvinceDetail(p); highlightProvince(name); } };
  window.filterPolicy = filterPolicy;
  window.selectPolicy = function(id) { const p = policyData.find(x => x.id === id); if (p) { renderPolicyDetail(p); renderPolicyList(); } };

  function v(id) { return document.getElementById(id).value.trim(); }

})();
