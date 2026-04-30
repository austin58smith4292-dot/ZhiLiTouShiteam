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
    { id: 'd1', company: '粤港跨境科技', topic: '跨境数据申报协同', content: '我们在珠三角业务中最关注多部门接口标准不统一的问题，建议建立统一字段模板和校验规范。', time: '2小时前', likes: 3824 },
    { id: 'd2', company: '长三角品牌出海联盟', topic: '海外仓与退换货规则', content: '企业更需要明确海外仓库存监管与退换货闭环规则，尤其是平台、仓储和海关之间的数据联动。', time: '今天', likes: 2956 },
    { id: 'd3', company: '中西部综试区服务中心', topic: '地方政策落地差异', content: '同类政策在不同城市执行尺度不同，建议形成可对比的政策执行清单与反馈机制。', time: '昨天', likes: 2103 },
    { id: 'd4', company: '深圳跨境电商协会', topic: '平台合规审查新要求', content: '亚马逊、TikTok Shop等主流平台今年陆续更新合规审查标准，尤其在产品认证、税务注册和数据本地化方面要求趋严。建议中小卖家尽早对标，避免账号被封风险。', time: '3小时前', likes: 5412 },
    { id: 'd5', company: '义乌国际贸易研究院', topic: '小包直邮与海外仓协同策略', content: '随着各目标市场对小包免税门槛收紧（如美国取消800美元De Minimis），纯直邮模式压力骤增。建议将热销SKU提前备货至海外仓，以本地发货提升履约时效和转化率。', time: '5小时前', likes: 4788 },
    { id: 'd6', company: '杭州跨境大数据中心', topic: '跨境支付合规与汇率风险管控', content: '近期多家支付服务商收紧跨境收款资质审核，部分企业出现资金延迟到账问题。建议提前完成境外主体注册，分散使用多家持牌收款渠道，同时建立汇率对冲机制降低波动敞口。', time: '昨天', likes: 6230 },
    { id: 'd7', company: '广州南沙综试区', topic: '综试区政策红利如何高效落地', content: '南沙综试区在通关便利化和税收优惠方面政策力度较大，但部分企业反映申请流程繁琐、审批周期偏长。建议主管部门推出"一窗受理"数字化平台，实现政策申领全程在线可追溯。', time: '前天', likes: 3571 },
    { id: 'd8', company: '上海自贸区跨境服务商', topic: '数据出境安全评估实操难点', content: '《数据出境安全评估办法》落地后，我们在客户数据跨境传输环节遭遇较大合规压力。建议监管部门发布行业白名单和标准合同模板，降低中小企业合规成本，同时明确跨境电商场景下的豁免细则。', time: '2天前', likes: 7841 },
    { id: 'd9', company: '跨境电商品牌孵化中心', topic: '独立站 vs 平台：流量与合规双重压力', content: '平台流量红利收窄，越来越多企业转向独立站自建品牌。但独立站在数据隐私合规（GDPR/CCPA）、支付通道稳定性和广告投放政策方面面临更高门槛，建议品牌方做好长期合规投入规划。', time: '3天前', likes: 5993 },
    { id: 'd10', company: '宁波跨境物流协同平台', topic: '国际物流时效与成本优化', content: '受红海局势和舱位紧张影响，欧美干线运价近期再度走高，平均时效延长5–8天。建议企业提前规划Q4旺季备货节奏，优先与头程物流商锁定舱位，同时评估中欧班列作为补充通道的可行性。', time: '4天前', likes: 4417 },
    { id: 'd11', company: '成都中西部出海服务联盟', topic: '中西部跨境电商产业带崛起机遇', content: '随着郑州、西安、成都等内陆城市跨境综试区相继扩容，中西部产业带商家出海路径日趋成熟。建议当地政府加大对跨境电商专业人才培育的投入，并打通本地产业带与头部平台的直采对接渠道。', time: '5天前', likes: 3288 },
    { id: 'd12', company: '福建跨境电商合规研究所', topic: '知识产权保护与侵权预警机制', content: '海外平台对知识产权投诉处理日趋严格，国内卖家因商标、专利纠纷导致的listing下架案例明显增多。建议企业在进入新市场前完成目标国商标注册，并接入第三方侵权监测服务，构建主动防御体系。', time: '6天前', likes: 6654 },
    { id: 'd13', company: '天津跨境电商产业园', topic: '碳关税与绿色供应链合规挑战', content: '欧盟碳边境调节机制（CBAM）正式过渡期已启动，涉及钢铁、铝、电力等品类的跨境出口企业须提前核算碳足迹并做好申报准备。建议平台和品牌方共同推动供应商绿色认证，抢占绿色溢价市场先机。', time: '1周前', likes: 8102 }
  ];

  const quickPrompts = [
    '综合排名前三的省份是？', '广东治理优势是什么？',
    '跨境数据治理相关政策有哪些？', '开放度最低的地区有哪些？',
    '企业讨论中最集中的问题？'
  ];

  const hotTopics = [
    '跨境数据申报标准统一', '海外仓监管与退换货', '地方政策落地差异',
    '通关便利化新政解读', '跨境平台合规审查', '综试区扩围机会'
  ];

  /* ===== INIT ===== */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    bindNav(); bindButtons(); initAIChat();
    renderHeroStats(); renderPlatformStats(); renderRankings();
    renderJourneySteps(); renderInsights(); renderGovSteps();
    renderProvinceWelcome(); renderPolicyOverview();
    buildPolicyTags(); renderPolicyList(); renderPolicyDetail(policyData[0]);
    renderDiscussionFeed(); renderHotTopics(); loadChinaMap();
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
    const avg = (chinaData.reduce((s, p) => s + p.total, 0) / chinaData.length * 100).toFixed(1);
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
    const excellent = chinaData.filter(p => p.total >= 0.7).length;
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
      const pct = (p.total * 100).toFixed(1);
      return `<div class="ranking-item" onclick="goToProvince('${p.name}')">
        <div class="rank-num ${i < 3 ? 'top3' : ''}">${i + 1}</div>
        <div class="rank-info">
          <div class="rank-name">${p.name}</div>
          <div class="rank-bar-track">
            <div class="rank-bar-fill" style="width:${p.total * 100}%;background:${lvl.color}"></div>
          </div>
        </div>
        <div class="rank-score" style="color:${lvl.color}">${pct}</div>
      </div>`;
    }).join('');
  }

  function renderJourneySteps() {
    const steps = [
      ['省域感知', '通过中国地图直观看到治理能力梯度与评级分布。'],
      ['问题识别', '从数字政府、开放度、透明度三维度诊断地区短板。'],
      ['政策导航', '浏览跨境治理政策总览并进入具体政策原文。'],
      ['企业论坛', '汇聚企业讨论，形成实务问题池与热点话题。'],
      ['AI 协同', '快速检索政策、地区、讨论与优化建议。']
    ];
    document.getElementById('journey-steps').innerHTML = steps.map(([k, v]) =>
      `<div class="journey-step"><strong>${k}：</strong>${v}</div>`
    ).join('');
  }

  function renderInsights() {
    const items = [
      ['图', '可视化更聚焦', '强化地图、雷达图与 AI 入口联动，核心功能一眼可见。'],
      ['策', '三维指标体系', '数字政府 · 开放度 · 透明度三项权威指标综合评价。'],
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
      ['STEP 1', '区域识别', '从地图点击目标省份，查看治理评分与三维雷达画像。'],
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
        <h3>省域跨境治理能力地图</h3>
        <p>基于<strong>数字政府发展指数</strong>（清华）、<strong>开放度综合指数</strong>（复旦）、<strong>透明度总分</strong>（浙大）三项权威指标，采用熵值法合成综合评分。点击任意省份查看详细雷达画像。</p>
        <div class="top-list">
          ${sorted.map((p, i) => {
            const lvl = getProvinceLevel(p.total);
            return `<div class="top-item" onclick="goToMapProvince('${p.name}')">
              <strong>TOP ${i + 1} · ${p.name}</strong> &nbsp; 综合评分 ${(p.total * 100).toFixed(1)}，评级 <span style="color:${lvl.color};font-weight:700">${lvl.level}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  /* ===== RADAR CHART ===== */
  function drawRadarChart(p) {
    const size = 200;
    const cx = size / 2, cy = size / 2 + 6;
    const R = 70;
    const angles = [-Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6];
    const labels = ['数字政府', '开放度', '透明度'];
    const maxVals = [83.03, 78.47, 85.11];
    const rawVals = [p.digitalGov, p.openness, p.transparency];
    const normVals = rawVals.map((v, i) => Math.min(v / maxVals[i], 1));
    const lvl = getProvinceLevel(p.total);

    let svg = '';
    // Grid
    [0.25, 0.5, 0.75, 1.0].forEach(level => {
      const pts = angles.map(a => {
        const r = R * level;
        return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
      }).join(' ');
      svg += `<polygon points="${pts}" fill="none" stroke="${level === 1 ? 'rgba(13,110,92,0.3)' : 'rgba(13,110,92,0.1)'}" stroke-width="${level === 1 ? 1.2 : 0.7}"/>`;
    });
    // Axes
    angles.forEach(a => {
      svg += `<line x1="${cx}" y1="${cy}" x2="${(cx + R * Math.cos(a)).toFixed(1)}" y2="${(cy + R * Math.sin(a)).toFixed(1)}" stroke="rgba(13,110,92,0.18)" stroke-width="1"/>`;
    });
    // Data polygon
    const pts = angles.map((a, i) => {
      const r = R * normVals[i];
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    });
    svg += `<polygon points="${pts.join(' ')}" fill="${lvl.color}22" stroke="${lvl.color}" stroke-width="2" stroke-linejoin="round"/>`;
    // Points
    angles.forEach((a, i) => {
      const r = R * normVals[i];
      svg += `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="3.5" fill="${lvl.color}" stroke="white" stroke-width="1.5"/>`;
    });
    // Labels
    const ld = R + 20;
    angles.forEach((a, i) => {
      const lx = cx + ld * Math.cos(a);
      const ly = cy + ld * Math.sin(a);
      const ta = i === 0 ? 'middle' : (i === 1 ? 'start' : 'end');
      svg += `<text x="${lx.toFixed(1)}" y="${(ly - 4).toFixed(1)}" text-anchor="${ta}" font-size="8.5" fill="#4a5e5c" font-weight="600" font-family="sans-serif">${labels[i]}</text>`;
      svg += `<text x="${lx.toFixed(1)}" y="${(ly + 7).toFixed(1)}" text-anchor="${ta}" font-size="9" fill="${lvl.color}" font-weight="700" font-family="sans-serif">${rawVals[i].toFixed(1)}</text>`;
    });

    return `<svg viewBox="0 0 ${size} ${size + 10}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:200px;display:block;margin:0 auto">${svg}</svg>`;
  }

  function renderProvinceDetail(p) {
    selectedProvince = p;
    const lvl = getProvinceLevel(p.total);
    const badgeStyle = `background:${lvl.color}18;color:${lvl.color};border:1px solid ${lvl.color}50`;
    const scoreDisplay = (p.total * 100).toFixed(1);

    const metrics = [
      { label: '数字政府发展指数', val: p.digitalGov, max: 83.03, color: '#0d6e5c', sub: '清华大学 · 权重 0.345' },
      { label: '开放度综合指数', val: p.openness, max: 78.47, color: '#2563a8', sub: '复旦大学 · 权重 0.306' },
      { label: '透明度总分', val: p.transparency, max: 85.11, color: '#c77a1a', sub: '浙江大学 · 权重 0.349' }
    ];

    document.getElementById('province-detail-panel').innerHTML = `
      <div class="province-card">
        <div class="province-card-top">
          <div class="province-title-row">
            <h3>${p.name}</h3>
            <div class="score-badge" style="${badgeStyle}">${lvl.level}</div>
          </div>
          <div class="score-num">${scoreDisplay}<span class="score-unit"> / 100</span></div>
          <div class="score-sub">省域跨境治理综合评分（熵值法）</div>
        </div>
        <div class="province-body">
          <div class="radar-section">
            <div class="radar-title">三维指标雷达图</div>
            ${drawRadarChart(p)}
          </div>
          <div class="metrics-section">
            ${metrics.map(m => `
              <div class="metric-row">
                <div class="metric-header">
                  <span class="metric-label">${m.label}</span>
                  <span class="metric-val" style="color:${m.color}">${m.val.toFixed(1)}</span>
                </div>
                <div class="metric-track">
                  <div class="metric-fill" style="width:${(m.val / m.max * 100).toFixed(1)}%;background:${m.color}"></div>
                </div>
                <div class="metric-sub">${m.sub}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="probs">
          ${p.problems.slice(0, 2).map(x => `<div class="prob-item">⚠ ${x}</div>`).join('')}
        </div>
        <div class="advs">
          ${p.solutions.slice(0, 2).map(x => `<div class="adv-item">✓ ${x}</div>`).join('')}
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

  window.startCompare = function(name) {
    const p = chinaData.find(x => x.name === name);
    if (!p) return;
    compareMode = true; compareProvince = p;
    const panel = document.getElementById('province-detail-panel');
    if (!panel.querySelector('.compare-mode-note')) {
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
    document.getElementById('compare-panel').style.display = 'block';
    const metrics = [
      { label: '数字政府', k: 'digitalGov', max: 83.03 },
      { label: '开放度', k: 'openness', max: 78.47 },
      { label: '透明度', k: 'transparency', max: 85.11 }
    ];
    const colors = ['#0d6e5c', '#2563a8', '#c77a1a'];
    const renderCol = (p, baseColor) => `
      <div class="cmp-col">
        <div class="cmp-name">${p.name}</div>
        <div class="cmp-score" style="color:${getProvinceLevel(p.total).color}">${(p.total * 100).toFixed(1)}</div>
        <div class="cmp-radar">${drawRadarChart(p)}</div>
        <div class="cmp-bar-row">
          ${metrics.map((m, i) => `
            <div class="cmp-row">
              <div class="cmp-label">${m.label}</div>
              <div class="cmp-track"><div class="cmp-fill" style="width:${(p[m.k] / m.max * 100).toFixed(1)}%;background:${colors[i]}"></div></div>
              <div class="cmp-val">${p[m.k].toFixed(1)}</div>
            </div>`).join('')}
        </div>
      </div>`;
    document.getElementById('compare-body').innerHTML =
      renderCol(p1, 'var(--jade)') + renderCol(p2, 'var(--blue)');
    compareMode = false; compareProvince = null;
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
      <div class="pol-detail">
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
    if (likedItems.has(id)) likedItems.delete(id); else likedItems.add(id);
    renderDiscussionFeed();
  };

  function renderHotTopics() {
    document.getElementById('hot-topics').innerHTML = hotTopics.map((t, i) => `
      <div class="hot-item" onclick="fillTopic('${t}')">
        <span class="hot-no ${i < 3 ? 'h' + (i+1) : ''}">${i + 1}</span>
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
    discussions.unshift({ id: 'u' + Date.now(), company, topic, content, time: '刚刚', likes: 0 });
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
    addAIMessage('bot', '你好，我是跨境治理 AI 助手 ✦\n\n可以问我政策、省域三维指标画像、企业论坛热点，或让我帮你查找相关内容。');
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

  window.askQuick = function(q) { document.getElementById('ai-input').value = q; sendAIMessage(); };

  function sendAIMessage() {
    const input = document.getElementById('ai-input');
    const q = input.value.trim();
    if (!q) return;
    addAIMessage('user', q); input.value = '';
    const tid = 'typing_' + Date.now(); addTypingIndicator(tid);
    setTimeout(() => { removeTypingIndicator(tid); addAIMessage('bot', answerQuestion(q)); }, 700 + Math.random() * 500);
  }

  function addAIMessage(role, text) {
    const box = document.getElementById('ai-messages');
    const wrap = document.createElement('div');
    wrap.className = `ai-msg ${role === 'user' ? 'user' : ''}`;
    wrap.innerHTML = `<div class="ai-msg-label">${role === 'user' ? '你' : 'AI 助手'}</div>
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

  function removeTypingIndicator(id) { const el = document.getElementById(id); if (el) el.remove(); }

  function answerQuestion(q) {
    const s = q.toLowerCase();
    const province = chinaData.find(p => s.includes(p.name) || q.includes(p.name));
    if (province) {
      const lvl = getProvinceLevel(province.total);
      return `${province.name}综合评分 ${(province.total * 100).toFixed(1)}，评级「${lvl.level}」。\n\n三维指标：\n· 数字政府 ${province.digitalGov.toFixed(1)}（清华·权重0.345）\n· 开放度 ${province.openness.toFixed(1)}（复旦·权重0.306）\n· 透明度 ${province.transparency.toFixed(1)}（浙大·权重0.349）\n\n主要短板：${province.problems.slice(0, 1).join('；')}。`;
    }
    const policy = policyData.find(p => q.includes(p.title.slice(0, 8)) || p.tags.some(t => q.includes(t)));
    if (policy) {
      return `推荐查看《${policy.title}》。\n\n${policy.org} · ${policy.year}年发布，核心内容包括：\n${policy.highlights.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\n右侧政策导航界面可直接点开查看原文。`;
    }
    if (s.includes('开放') && (s.includes('低') || s.includes('最低'))) {
      const bottom5 = [...chinaData].sort((a, b) => a.openness - b.openness).slice(0, 5);
      return `开放度最低的5个省份：\n${bottom5.map(p => `· ${p.name}（开放度 ${p.openness.toFixed(1)} 分）`).join('\n')}\n\n这些省份在复旦大学开放数林指数上得分偏低，公共数据开放程度有较大提升空间。`;
    }
    if (s.includes('政策') || s.includes('数据') || s.includes('治理'))
      return '跨境治理政策主要分为五类：\n1. 跨境电商高质量发展\n2. 海外仓与物流建设\n3. 零售进口监管\n4. 数据出境安全\n5. 外贸稳规模与结构优化\n\n可进一步说明想查哪一类。';
    if (s.includes('讨论') || s.includes('企业') || s.includes('论坛'))
      return `当前企业论坛中较集中的主题有：\n${discussions.slice(0, 3).map(d => `· ${d.topic}`).join('\n')}\n\n主要聚焦数据接口统一、海外仓协同和地方政策执行差异。`;
    const top3 = [...chinaData].sort((a, b) => b.total - a.total).slice(0, 3).map(p => `${p.name}(${(p.total * 100).toFixed(1)})`).join('、');
    return `我可以帮你查询政策、省份三维指标和企业论坛内容。\n\n当前综合能力较强的省份：${top3}。\n\n可按"省份名称""政策主题"或"企业问题关键词"继续提问。`;
  }

  /* ===== D3 MAP ===== */
  function loadChinaMap() {
    const c = document.getElementById('china-map-svg');
    if (!c || !window.CHINA_PROVINCES_GEOJSON) return;
    if (c.querySelector('svg')) return;
    const w = c.clientWidth || 860, h = c.clientHeight || 600;
    const svg = d3.select(c).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', `0 0 ${w} ${h}`);

    const defs = svg.append('defs');
    const pat = defs.append('pattern').attr('id', 'mapgrid').attr('width', 28).attr('height', 28).attr('patternUnits', 'userSpaceOnUse');
    pat.append('circle').attr('cx', 1).attr('cy', 1).attr('r', .8).attr('fill', 'rgba(100,140,130,.15)');
    svg.append('rect').attr('width', w).attr('height', h).attr('fill', '#f2efe8');
    svg.append('rect').attr('width', w).attr('height', h).attr('fill', 'url(#mapgrid)');

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
           <span>综合评分：${(p.total * 100).toFixed(1)} · <span style="color:${lvl.color};font-weight:700">${lvl.level}</span></span>
           <span>数字政府 ${p.digitalGov.toFixed(1)} · 开放度 ${p.openness.toFixed(1)} · 透明度 ${p.transparency.toFixed(1)}</span>`
        );
      })
      .on('mousemove', e => {
        const [x, y] = d3.pointer(e, c);
        tooltip.style('left', `${x + 14}px`).style('top', `${y - 56}px`);
      })
      .on('mouseout', function(e, d) {
        if (!d3.select(this).classed('selected')) d3.select(this).attr('stroke', 'rgba(255,255,255,.7)').attr('stroke-width', .6);
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
    const aliases = { InnerMongolia: '内蒙古', NeiMongol: '内蒙古', Hongkong: '香港', Macau: '澳门', Taiwan: '台湾', Xizang: '西藏', Xinjiang: '新疆', Ningxia: '宁夏', Guangxi: '广西', Qinghai: '青海', Shaanxi: '陕西', Chongqing: '重庆', Heilongjiang: '黑龙江', Jiangxi: '江西', Hubei: '湖北', Hunan: '湖南', Guangdong: '广东', Beijing: '北京', Shanghai: '上海', Tianjin: '天津', Hebei: '河北', Shanxi: '山西', Liaoning: '辽宁', Jilin: '吉林', Shandong: '山东', Henan: '河南', Jiangsu: '江苏', Zhejiang: '浙江', Fujian: '福建', Hainan: '海南', Sichuan: '四川', Guizhou: '贵州', Yunnan: '云南', Gansu: '甘肃', Qianghai: '青海', Tibet: '西藏' };
    const mapped = aliases[clean] || aliases[clean.replace(/\s+/g, '')];
    if (mapped && provinceNameMap[mapped]) return provinceCodeMap[provinceNameMap[mapped]];
    return null;
  }

  /* ===== EXPORTS ===== */
  window.goToProvince = function(name) { showSection('map'); setTimeout(() => { const p = chinaData.find(x => x.name === name); if (p) { renderProvinceDetail(p); highlightProvince(name); } }, 80); };
  window.goToMapProvince = function(name) { const p = chinaData.find(x => x.name === name); if (p) { renderProvinceDetail(p); highlightProvince(name); } };
  window.filterPolicy = filterPolicy;
  window.selectPolicy = function(id) { const p = policyData.find(x => x.id === id); if (p) { renderPolicyDetail(p); renderPolicyList(); } };

  function v(id) { return document.getElementById(id).value.trim(); }
})();
