// ============================================================
// app.js — 治理透镜·跨境数字治理评估平台 应用逻辑
// ============================================================

(function () {
  "use strict";

  const EN_PROVINCE_TO_CN = {
    "beijing": "北京",
    "tianjin": "天津",
    "hebei": "河北",
    "shanxi": "山西",
    "innermongolia": "内蒙古",
    "liaoning": "辽宁",
    "jilin": "吉林",
    "heilongjiang": "黑龙江",
    "shanghai": "上海",
    "jiangsu": "江苏",
    "zhejiang": "浙江",
    "anhui": "安徽",
    "fujian": "福建",
    "jiangxi": "江西",
    "shandong": "山东",
    "henan": "河南",
    "hubei": "湖北",
    "hunan": "湖南",
    "guangdong": "广东",
    "guangxi": "广西",
    "hainan": "海南",
    "chongqing": "重庆",
    "sichuan": "四川",
    "guizhou": "贵州",
    "yunnan": "云南",
    "tibet": "西藏",
    "shaanxi": "陕西",
    "gansu": "甘肃",
    "qianghai": "青海",
    "qinghai": "青海",
    "ningxia": "宁夏",
    "xinjiang": "新疆"
  };

  // ——— 全局状态 ———
  let currentTab = "world";
  let worldSvg = null, chinaSvg = null;
  let worldMapLoaded = false, chinaMapLoaded = false;
  let radarChart = null;
  let selectedCountry = null, selectedProvince = null;

  // ——— DOM 就绪后初始化 ———
  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setupTabs();
    loadWorldMap();
    worldMapLoaded = true;
    showDefaultWorldPanel();
    setupMapResize();
  }

  function setupMapResize() {
    let timer = null;
    window.addEventListener("resize", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (currentTab === "world" && worldMapLoaded) loadWorldMap();
        if (currentTab === "china" && chinaMapLoaded) loadChinaMap();
      }, 180);
    });
  }

  // ============================================================
  // 标签切换
  // ============================================================
  function setupTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (tab === currentTab) return;
        currentTab = tab;
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".panel-section").forEach(s => s.classList.remove("active"));
        document.getElementById(tab + "-section").classList.add("active");
        if (tab === "world") {
          if (!worldMapLoaded) {
            loadWorldMap();
            worldMapLoaded = true;
          }
          showDefaultWorldPanel();
        } else {
          if (!chinaMapLoaded) {
            loadChinaMap();
            chinaMapLoaded = true;
          }
          showDefaultChinaPanel();
        }
      });
    });
  }

  // ============================================================
  // 世界地图 (D3 + world-atlas topojson)
  // ============================================================
  function loadWorldMap() {
    const container = document.getElementById("world-map-svg");
    if (!container) return;
    container.innerHTML = "";
    const W = container.clientWidth || 800;
    const H = container.clientHeight || 440;

    const svg = d3.select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${W} ${H}`);

    worldSvg = svg;

    const projection = d3.geoNaturalEarth1();

    const path = d3.geoPath().projection(projection);

    // 背景海洋
    svg.append("rect")
      .attr("width", W).attr("height", H)
      .attr("fill", "#f7efe2");

    const g = svg.append("g").attr("class", "countries");

    // 缩放支持
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    // Tooltip
    const tooltip = d3.select(container).append("div").attr("class", "map-tooltip");

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(world => {
        const countries = topojson.feature(world, world.objects.countries);
        // 适当留白，避免视觉上被“压扁/过满”
        projection.fitExtent([[28, 20], [W - 28, H - 20]], countries);

        g.selectAll("path")
          .data(countries.features)
          .enter().append("path")
          .attr("class", "country-path")
          .attr("d", path)
          .attr("fill", d => {
            const data = countryCodeMap[+d.id];
            return data ? data.risk.color : "#2d3f5e";
          })
          .attr("stroke", "#cdbb9b")
          .attr("stroke-width", 0.4)
          .style("cursor", d => countryCodeMap[+d.id] ? "pointer" : "default")
          .on("mouseover", function (event, d) {
            const data = countryCodeMap[+d.id];
            if (!data) return;
            d3.select(this).attr("stroke-width", 1.5).attr("stroke", "#8b6a32");
            tooltip.style("display", "block")
              .html(`<strong>${data.name}</strong><br/>${data.nameEn}<br/>${data.risk.level}：${data.composite.toFixed(1)}分`);
          })
          .on("mousemove", function (event) {
            const [mx, my] = d3.pointer(event, container);
            tooltip.style("left", (mx + 12) + "px").style("top", (my - 30) + "px");
          })
          .on("mouseout", function (event, d) {
            const data = countryCodeMap[+d.id];
            d3.select(this).attr("stroke-width", 0.4).attr("stroke", "#cdbb9b");
            tooltip.style("display", "none");
          })
          .on("click", function (event, d) {
            const data = countryCodeMap[+d.id];
            if (!data) return;
            event.stopPropagation();
            selectCountry(data, this, g);
          });

        // 绘制边界线
        g.append("path")
          .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
          .attr("d", path)
          .attr("fill", "none")
          .attr("stroke", "#cdbb9b")
          .attr("stroke-width", 0.4);

        drawWorldLegend(svg, W, H);
        addCountryLabels();
      })
      .catch(err => {
        console.error("加载世界地图失败:", err);
        svg.append("text").attr("x", W / 2).attr("y", H / 2)
          .attr("text-anchor", "middle").attr("fill", "#aaa")
          .text("地图加载失败，请检查网络连接");
      });
  }

  function selectCountry(data, el, g) {
    // 重置之前选中
    g.selectAll(".country-path")
      .classed("selected", false)
      .attr("stroke", "#cdbb9b")
      .attr("stroke-width", 0.4);
    d3.select(el)
      .classed("selected", true)
      .attr("stroke", "#f0c040")
      .attr("stroke-width", 2.5);
    selectedCountry = data;
    showCountryDetail(data);
  }

  function drawWorldLegend(svg, W, H) {
    const items = [
      { label: "低风险 (≥85)", color: "#27ae60" },
      { label: "中等风险 (70-84)", color: "#3498db" },
      { label: "较高风险 (55-69)", color: "#f39c12" },
      { label: "高风险 (<55)", color: "#e74c3c" },
      { label: "数据缺失", color: "#2d3f5e" },
    ];
    const lx = 12, ly = H - 110;
    const legend = svg.append("g").attr("transform", `translate(${lx},${ly})`);
    legend.append("rect").attr("width", 148).attr("height", items.length * 20 + 16)
      .attr("rx", 6).attr("fill", "rgba(255,250,240,0.95)").attr("stroke", "#cfbda0").attr("stroke-width", 1);
    items.forEach((item, i) => {
      legend.append("rect").attr("x", 10).attr("y", 10 + i * 20).attr("width", 12).attr("height", 12).attr("rx", 2).attr("fill", item.color);
      legend.append("text").attr("x", 28).attr("y", 21 + i * 20).attr("fill", "#4d5b69").attr("font-size", "11px").text(item.label);
    });
  }

  function addCountryLabels() {
    // 不添加标签，保持地图清洁
  }

  // ============================================================
  // 中国地图 (D3 + DataV GeoJSON)
  // ============================================================
  function loadChinaMap() {
    const container = document.getElementById("china-map-svg");
    if (!container) return;
    container.innerHTML = "";
    const W = container.clientWidth || 700;
    const H = container.clientHeight || 480;

    const svg = d3.select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${W} ${H}`);

    chinaSvg = svg;

    svg.append("rect").attr("width", W).attr("height", H).attr("fill", "#f7efe2");
    const g = svg.append("g").attr("class", "provinces");
    const zoom = d3.zoom().scaleExtent([1, 10]).on("zoom", (ev) => g.attr("transform", ev.transform));
    svg.call(zoom);
    const tooltip = d3.select(container).append("div").attr("class", "map-tooltip");

    // 优先使用 data.js 内嵌数据，避免 file:// 或本地服务路径导致的读取失败
    if (typeof window !== "undefined" && window.CHINA_PROVINCES_GEOJSON) {
      renderChinaMap(window.CHINA_PROVINCES_GEOJSON, g, svg, W, H, tooltip);
      return;
    }

    const chinaSources = [
      "https://geo.datav.aliyun.com/areas_v3/bound/100000.json",
      "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
      "https://raw.githubusercontent.com/echarts-maps/echarts-china-provinces-js/master/china.geojson"
    ];

    tryLoadChinaMap(chinaSources, 0, g, svg, W, H, tooltip);
  }

  function tryLoadChinaMap(sources, idx, g, svg, W, H, tooltip) {
    if (idx >= sources.length) {
      svg.append("text").attr("x", W / 2).attr("y", H / 2)
        .attr("text-anchor", "middle").attr("fill", "#888")
        .text("中国地图加载失败，请检查网络连接");
      return;
    }
    d3.json(sources[idx])
      .then(geo => renderChinaMap(geo, g, svg, W, H, tooltip))
      .catch(() => tryLoadChinaMap(sources, idx + 1, g, svg, W, H, tooltip));
  }

  function renderChinaMap(geo, g, svg, W, H, tooltip) {
    const normalizedGeo = normalizeGeoJSON(geo);
    if (!normalizedGeo || !normalizedGeo.features || !normalizedGeo.features.length) {
      svg.append("text")
        .attr("x", W / 2)
        .attr("y", H / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#888")
        .text("中国地图数据格式不支持");
      return;
    }

    const provinceGeo = toProvinceLevelGeo(normalizedGeo);
    if (!provinceGeo.features || !provinceGeo.features.length) {
      svg.append("text")
        .attr("x", W / 2)
        .attr("y", H / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#888")
        .text("中国地图数据为空");
      return;
    }

    const projection = d3.geoMercator();
    const path = d3.geoPath().projection(projection);
    projection.fitExtent([[12, 12], [W - 12, H - 12]], provinceGeo);
    ensureMapFillsViewport(projection, path, provinceGeo, W, H);

    g.selectAll("path")
      .data(provinceGeo.features)
      .enter().append("path")
      .attr("class", "province-path")
      .attr("d", path)
      .attr("fill", d => {
        const adcode = d.properties.adcode || d.properties.id;
        const name = d.properties.name || "";
        const prov = getProvinceByNameOrCode(name, adcode);
        return prov ? getProvinceLevel(prov.total).color : "#b8cae3";
      })
      .attr("stroke", "#cdbb9b")
      .attr("stroke-width", 0.8)
      .style("cursor", d => {
        const adcode = d.properties.adcode || d.properties.id;
        const name = d.properties.name || "";
        return getProvinceByNameOrCode(name, adcode) ? "pointer" : "default";
      })
      .on("mouseover", function (event, d) {
        const name = d.properties.name || "";
        const adcode = d.properties.adcode || d.properties.id;
        const prov = getProvinceByNameOrCode(name, adcode);
        if (!prov) return;
        d3.select(this).attr("stroke", "#8b6a32").attr("stroke-width", 2);
        tooltip.style("display", "block")
          .html(`<strong>${prov.name}</strong><br/>综合得分：${prov.total.toFixed(1)} · ${getProvinceLevel(prov.total).level}`);
      })
      .on("mousemove", function (event) {
        const cont = document.getElementById("china-map-svg");
        const [mx, my] = d3.pointer(event, cont);
        tooltip.style("left", (mx + 12) + "px").style("top", (my - 30) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#cdbb9b").attr("stroke-width", 0.8);
        tooltip.style("display", "none");
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        const name = d.properties.name || "";
        const adcode = d.properties.adcode || d.properties.id;
        const prov = getProvinceByNameOrCode(name, adcode);
        if (!prov) return;
        g.selectAll(".province-path")
          .classed("selected", false)
          .attr("stroke", "#cdbb9b")
          .attr("stroke-width", 0.8);
        d3.select(this)
          .classed("selected", true)
          .attr("stroke", "#f0c040")
          .attr("stroke-width", 2.5);
        selectedProvince = prov;
        showProvinceDetail(prov);
      });

    // 省份名称标签
    g.selectAll("text")
      .data(provinceGeo.features)
      .enter().append("text")
      .attr("transform", d => {
        const c = path.centroid(d);
        return `translate(${c[0]}, ${c[1]})`;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "9px")
      .attr("fill", "rgba(86,101,117,0.8)")
      .attr("pointer-events", "none")
      .text(d => {
        const adcode = d.properties.adcode || d.properties.id;
        const rawName = d.properties.name || "";
        const prov = getProvinceByNameOrCode(rawName, adcode);
        const name = prov ? prov.name : rawName.replace(/省|市|自治区|壮族|回族|维吾尔|特别行政区/g, "");
        return name.length <= 3 ? name : name.slice(0, 3);
      });

    drawChinaLegend(svg, W, H);
    drawSouthChinaSeaInset(g, path, provinceGeo);
  }

  function normalizeGeoJSON(input) {
    if (!input) return null;
    if (input.type === "FeatureCollection" && Array.isArray(input.features)) return input;
    if (Array.isArray(input.features)) return { type: "FeatureCollection", features: input.features };
    if (input.type === "Topology" && typeof topojson !== "undefined") {
      const objKey = Object.keys(input.objects || {})[0];
      if (!objKey) return null;
      return topojson.feature(input, input.objects[objKey]);
    }
    return null;
  }

  function toProvinceLevelGeo(featureCollection) {
    // 对 full 数据做省级聚合过滤：优先保留 adcode 末4位为 0000 的省级面
    const fs = featureCollection.features || [];
    const isProvinceFeature = f => {
      const adcode = String((f.properties && (f.properties.adcode || f.properties.id)) || "");
      if (!adcode) return false;
      return adcode.length === 6 && adcode.endsWith("0000");
    };

    const provinceFeatures = fs.filter(isProvinceFeature);
    if (provinceFeatures.length >= 25) {
      return { type: "FeatureCollection", features: provinceFeatures };
    }

    // 若源数据本身已是省级，或无 adcode 结构，则做几何清洗避免异常要素导致地图缩成小角落
    const filtered = fs.filter(f => {
      const s = getGeometryStats(f && f.geometry);
      if (!s) return false;
      const { minX, minY, maxX, maxY, spanX, spanY, centerX, centerY } = s;
      // 1) 必须是经纬度有效值
      const finite = [minX, minY, maxX, maxY, spanX, spanY, centerX, centerY].every(Number.isFinite);
      if (!finite) return false;
      // 2) 必须落在中国及周边合理范围
      const inChinaBox = minX >= 70 && maxX <= 140 && minY >= 10 && maxY <= 60;
      if (!inChinaBox) return false;
      // 3) 单个省份范围不应异常巨大（防止全球边界误入）
      if (spanX > 30 || spanY > 22) return false;
      // 4) 中心点也做一次约束，进一步兜底
      if (centerX < 73 || centerX > 136 || centerY < 15 || centerY > 55) return false;
      return true;
    });

    return {
      type: "FeatureCollection",
      features: filtered.length >= 20 ? filtered : fs
    };
  }

  function getGeometryStats(geometry) {
    if (!geometry || !geometry.coordinates) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let count = 0;

    const walk = node => {
      if (!Array.isArray(node)) return;
      if (typeof node[0] === "number" && typeof node[1] === "number") {
        const x = node[0], y = node[1];
        if (Number.isFinite(x) && Number.isFinite(y)) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
          count += 1;
        }
        return;
      }
      node.forEach(walk);
    };

    walk(geometry.coordinates);
    if (!count) return null;
    return {
      minX, minY, maxX, maxY,
      spanX: maxX - minX,
      spanY: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  }

  function getFeatureCollectionStats(features) {
    if (!Array.isArray(features) || !features.length) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let valid = 0;
    features.forEach(f => {
      const s = getGeometryStats(f && f.geometry);
      if (!s) return;
      minX = Math.min(minX, s.minX);
      minY = Math.min(minY, s.minY);
      maxX = Math.max(maxX, s.maxX);
      maxY = Math.max(maxY, s.maxY);
      valid += 1;
    });
    if (!valid) return null;
    return { minX, minY, maxX, maxY };
  }

  function buildBBoxFeature(b) {
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [b.minX, b.minY],
          [b.maxX, b.minY],
          [b.maxX, b.maxY],
          [b.minX, b.maxY],
          [b.minX, b.minY]
        ]]
      },
      properties: {}
    };
  }

  function ensureMapFillsViewport(projection, path, featureCollection, W, H) {
    const safeW = Math.max(1, W - 24);
    const safeH = Math.max(1, H - 24);
    let bounds = path.bounds(featureCollection);
    let bw = bounds[1][0] - bounds[0][0];
    let bh = bounds[1][1] - bounds[0][1];
    if (!Number.isFinite(bw) || !Number.isFinite(bh) || bw <= 0 || bh <= 0) return;

    // 当地图在画布中占比过小（例如被异常边界影响）时，进行二次放大
    const ratioW = bw / safeW;
    const ratioH = bh / safeH;
    if (ratioW < 0.75 || ratioH < 0.75) {
      const factor = Math.min(safeW / bw, safeH / bh) * 0.98;
      projection.scale(projection.scale() * factor);
      bounds = path.bounds(featureCollection);
      bw = bounds[1][0] - bounds[0][0];
      bh = bounds[1][1] - bounds[0][1];
    }

    // 始终把地图几何中心移到画布中心
    const cx = (bounds[0][0] + bounds[1][0]) / 2;
    const cy = (bounds[0][1] + bounds[1][1]) / 2;
    const tr = projection.translate();
    projection.translate([tr[0] + (W / 2 - cx), tr[1] + (H / 2 - cy)]);
  }

  function getProvinceByNameOrCode(name, adcode) {
    // 尝试通过 adcode 匹配
    if (adcode) {
      const code = parseInt(adcode);
      if (provinceCodeMap[code]) return provinceCodeMap[code];
      // DataV adcode 有时只有前2位+0000
      const baseCode = Math.floor(code / 10000) * 10000;
      if (provinceCodeMap[baseCode]) return provinceCodeMap[baseCode];
    }
    // 尝试通过名称匹配
    if (name) {
      const clean = name.replace(/省|市|自治区|壮族|回族|维吾尔|特别行政区/g, "");
      for (const key of Object.keys(provinceNameMap)) {
        if (clean.includes(key) || key.includes(clean)) {
          return provinceCodeMap[provinceNameMap[key]];
        }
      }

      // 英文名称映射（兼容本地 geojson）
      const enKey = clean.toLowerCase().replace(/\s+/g, "");
      const cnName = EN_PROVINCE_TO_CN[enKey];
      if (cnName && provinceNameMap[cnName]) {
        return provinceCodeMap[provinceNameMap[cnName]];
      }

      // 兼容常见英文别名
      const aliases = {
        neimongol: "内蒙古",
        inner_mongolia: "内蒙古",
        xinjianguyur: "新疆",
        xizang: "西藏",
        ningxiahui: "宁夏",
        guangxizhuang: "广西"
      };
      const aliasName = aliases[enKey];
      if (aliasName && provinceNameMap[aliasName]) {
        return provinceCodeMap[provinceNameMap[aliasName]];
      }
    }
    return null;
  }

  function drawChinaLegend(svg, W, H) {
    const items = [
      { label: "优秀 (≥80)", color: "#27ae60" },
      { label: "良好 (70-79)", color: "#3498db" },
      { label: "中等 (62-69)", color: "#f39c12" },
      { label: "待提升 (<62)", color: "#e74c3c" },
    ];
    const lx = 12, ly = H - 100;
    const legend = svg.append("g").attr("transform", `translate(${lx},${ly})`);
    legend.append("rect").attr("width", 145).attr("height", items.length * 20 + 16)
      .attr("rx", 6).attr("fill", "rgba(255,250,240,0.95)").attr("stroke", "#cfbda0").attr("stroke-width", 1);
    items.forEach((item, i) => {
      legend.append("rect").attr("x", 10).attr("y", 10 + i * 20).attr("width", 12).attr("height", 12).attr("rx", 2).attr("fill", item.color);
      legend.append("text").attr("x", 28).attr("y", 21 + i * 20).attr("fill", "#4d5b69").attr("font-size", "11px").text(item.label);
    });
  }

  function drawSouthChinaSeaInset(mapLayer, path, provinceGeo) {
    const bounds = path.bounds(provinceGeo);
    const boxW = 128;
    const boxH = 200;
    // 放在中国主图右下角附近，并随地图图层一起缩放/平移
    const x = bounds[1][0] - boxW * 0.88;
    const y = bounds[1][1] - boxH * 0.96;

    const inset = mapLayer.append("g").attr("transform", `translate(${x},${y})`);

    inset.append("rect")
      .attr("width", boxW)
      .attr("height", boxH)
      .attr("rx", 2)
      .attr("fill", "#f1f1f1")
      .attr("stroke", "#b5b5b5")
      .attr("stroke-width", 1);

    // 直接使用用户提供的标准南海诸岛插图，避免手绘偏差
    const referenceInsetImage = "assets/nanhai-inset.png";
    inset.append("image")
      .attr("x", 1)
      .attr("y", 1)
      .attr("width", boxW - 2)
      .attr("height", boxH - 2)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("href", referenceInsetImage);
    return;

    // 顶部近岸区域：按标准插图，广西/广东/台湾只显示下部，海南岛完整显示
    const gx = findProvinceFeatureByName(provinceGeo, "广西");
    const gd = findProvinceFeatureByName(provinceGeo, "广东");
    const hi = findProvinceFeatureByName(provinceGeo, "海南");
    const tw = findProvinceFeatureByName(provinceGeo, "台湾");
    const coastalFeatures = [gx, gd, tw].filter(Boolean);
    if (coastalFeatures.length) {
      const coastalProj = d3.geoMercator();
      coastalProj.fitExtent([[2, -34], [boxW - 2, 78]], {
        type: "FeatureCollection",
        features: coastalFeatures
      });
      const coastalPath = d3.geoPath().projection(coastalProj);

      const clipId = `south-sea-top-clip-${Math.random().toString(36).slice(2, 9)}`;
      inset.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", boxW)
        .attr("height", 58);

      const topGroup = inset.append("g").attr("clip-path", `url(#${clipId})`);
      if (gx) {
        topGroup.append("path")
          .datum(gx)
          .attr("d", coastalPath)
          .attr("fill", "#e9bfd1")
          .attr("stroke", "#8aa8c8")
          .attr("stroke-width", 0.8);
      }
      if (gd) {
        topGroup.append("path")
          .datum(gd)
          .attr("d", coastalPath)
          .attr("fill", "#efe6cb")
          .attr("stroke", "#8aa8c8")
          .attr("stroke-width", 0.8);
      }
      if (tw) {
        topGroup.append("path")
          .datum(tw)
          .attr("d", coastalPath)
          .attr("fill", "#efe6cb")
          .attr("stroke", "#8aa8c8")
          .attr("stroke-width", 0.8);
      }
    }

    if (hi) {
      const hainanProj = d3.geoMercator();
      hainanProj.fitExtent([[16, 24], [48, 58]], {
        type: "FeatureCollection",
        features: [hi]
      });
      const hainanPath = d3.geoPath().projection(hainanProj);
      inset.append("path")
        .datum(hi)
        .attr("d", hainanPath)
        .attr("fill", "#efe6cb")
        .attr("stroke", "#8aa8c8")
        .attr("stroke-width", 0.8);
    }

    inset.append("text").attr("x", 22).attr("y", 15).attr("fill", "#7a7a7a").attr("font-size", "7px").text("广西");
    inset.append("text").attr("x", 66).attr("y", 15).attr("fill", "#7a7a7a").attr("font-size", "7px").text("广东");
    inset.append("text").attr("x", 114).attr("y", 15).attr("fill", "#7a7a7a").attr("font-size", "7px").text("台湾岛");
    inset.append("text").attr("x", 22).attr("y", 45).attr("fill", "#7a7a7a").attr("font-size", "7px").text("海南岛");

    inset.append("text")
      .attr("x", 74)
      .attr("y", 31)
      .attr("fill", "#8b8b8b")
      .attr("font-size", "6px")
      .text("香港");

    inset.append("text")
      .attr("x", 66)
      .attr("y", 35)
      .attr("fill", "#8b8b8b")
      .attr("font-size", "6px")
      .text("澳门");

    inset.append("text")
      .attr("x", 86)
      .attr("y", 74)
      .attr("fill", "#7d7d7d")
      .attr("font-size", "7px")
      .text("东沙群岛");

    inset.append("text")
      .attr("x", 42)
      .attr("y", 92)
      .attr("fill", "#7d7d7d")
      .attr("font-size", "7px")
      .text("西沙群岛");

    inset.append("text")
      .attr("x", 84)
      .attr("y", 118)
      .attr("fill", "#7d7d7d")
      .attr("font-size", "7px")
      .text("中沙群岛");

    inset.append("text")
      .attr("x", 80)
      .attr("y", 148)
      .attr("fill", "#7d7d7d")
      .attr("font-size", "7px")
      .text("南 沙 群 岛");

    inset.append("text")
      .attr("x", 50)
      .attr("y", 214)
      .attr("fill", "#7d7d7d")
      .attr("font-size", "7px")
      .text("曾母暗沙");

    const islandColor = "#7f7ba6";
    // 将南海诸岛几何整体缩小，形成“省份更大、诸岛更小”
    const islandScale = 0.66;
    const islandCenterX = 73;
    const islandCenterY = 152;
    const islandMatrix = `matrix(${islandScale},0,0,${islandScale},${(1 - islandScale) * islandCenterX},${(1 - islandScale) * islandCenterY})`;
    const islandStrokes = [
      [[26, 118], [36, 116], [37, 126], [27, 128]],
      [[118, 118], [129, 116], [130, 127], [119, 129]],
      [[20, 146], [30, 144], [31, 154], [21, 156]],
      [[124, 146], [135, 144], [136, 155], [125, 157]],
      [[24, 182], [34, 180], [35, 190], [25, 192]],
      [[120, 182], [131, 180], [132, 191], [121, 193]],
      [[16, 214], [27, 212], [28, 223], [17, 225]],
      [[94, 210], [106, 208], [107, 220], [95, 222]],
      [[60, 236], [72, 234], [73, 246], [61, 248]]
    ];

    islandStrokes.forEach(points => {
      inset.append("polygon")
        .attr("points", points.map(p => p.join(",")).join(" "))
        .attr("transform", islandMatrix)
        .attr("fill", islandColor)
        .attr("fill-opacity", 0.84)
        .attr("stroke", islandColor)
        .attr("stroke-width", 0.6);
    });

    const clusterTop = [
      [56, 124], [61, 126], [66, 124], [71, 128], [76, 130], [81, 132],
      [52, 134], [58, 136], [64, 138], [70, 136], [76, 140], [82, 142]
    ];

    const clusterMiddle = [
      [58, 158], [64, 160], [70, 158], [76, 162], [82, 164], [88, 166],
      [52, 168], [60, 170], [68, 172], [76, 170], [84, 174], [92, 176],
      [56, 180], [64, 182], [72, 184], [80, 186], [88, 188]
    ];

    const clusterTail = [
      [42, 194], [50, 196], [58, 198], [66, 200],
      [38, 206], [46, 208], [54, 210], [62, 212],
      [34, 218], [42, 220], [50, 222], [58, 224],
      [46, 230], [54, 232], [62, 234]
    ];

    const dottedIslands = clusterTop.concat(clusterMiddle, clusterTail);

    dottedIslands.forEach(([px, py]) => {
      inset.append("circle")
        .attr("cx", px)
        .attr("cy", py)
        .attr("transform", islandMatrix)
        .attr("r", 1.05)
        .attr("fill", "#47b7d8")
        .attr("fill-opacity", 0.85);
    });

    inset.append("rect")
      .attr("x", 97)
      .attr("y", 168)
      .attr("width", 44)
      .attr("height", 12)
      .attr("fill", "#f6f6f6")
      .attr("stroke", "#b5b5b5")
      .attr("stroke-width", 0.6);

    inset.append("text")
      .attr("x", 119)
      .attr("y", 177)
      .attr("fill", "#4f4f4f")
      .attr("font-size", "7px")
      .attr("text-anchor", "middle")
      .text("南海诸岛");
  }

  function findProvinceFeatureByName(provinceGeo, targetName) {
    if (!provinceGeo || !Array.isArray(provinceGeo.features)) return null;
    const normalized = String(targetName || "").trim();
    if (!normalized) return null;

    const tokenMap = {
      "广西": ["广西", "guangxi"],
      "广东": ["广东", "guangdong"],
      "海南": ["海南", "hainan"],
      "台湾": ["台湾", "taiwan"]
    };
    const tokens = tokenMap[normalized] || [normalized];

    const getName = f => {
      const p = (f && f.properties) || {};
      return String(p.name || p.NAME || p.fullname || "").toLowerCase();
    };

    for (const f of provinceGeo.features) {
      const n = getName(f);
      if (tokens.some(t => n.includes(String(t).toLowerCase()))) return f;
    }
    return null;
  }

  // ============================================================
  // 详情面板 — 世界
  // ============================================================
  function showDefaultWorldPanel() {
    const panel = document.getElementById("detail-panel");
    const lowCount = worldData.filter(d => d.composite >= 85).length;
    const mediumCount = worldData.filter(d => d.composite >= 70 && d.composite < 85).length;
    const higherCount = worldData.filter(d => d.composite >= 55 && d.composite < 70).length;
    const highCount = worldData.filter(d => d.composite < 55).length;
    panel.innerHTML = `
      <div class="detail-welcome">
        <div class="welcome-icon">🌍</div>
        <h3>全球数字治理评估</h3>
        <p>点击地图上的国家，查看国家尺度六维指标（GAIR×3 + EGDI×3）及综合风险分级</p>
        <div class="stat-row">
          <div class="stat-card"><div class="stat-val">${worldData.length}</div><div class="stat-lab">覆盖国家</div></div>
          <div class="stat-card"><div class="stat-val">6</div><div class="stat-lab">评估维度</div></div>
          <div class="stat-card"><div class="stat-val">2024</div><div class="stat-lab">数据年份</div></div>
        </div>
        <div class="risk-summary">
          <div class="risk-item low"><span class="dot"></span>低风险 (≥85) · ${lowCount}个</div>
          <div class="risk-item medium"><span class="dot"></span>中等风险 (70-84) · ${mediumCount}个</div>
          <div class="risk-item higher"><span class="dot"></span>较高风险 (55-69) · ${higherCount}个</div>
          <div class="risk-item high"><span class="dot"></span>高风险 (&lt;55) · ${highCount}个</div>
        </div>
      </div>`;
  }

  function showCountryDetail(data) {
    const panel = document.getElementById("detail-panel");
    const risk = data.risk;

    panel.innerHTML = `
      <div class="detail-content fade-in">
        <div class="detail-header">
          <div class="country-name">
            <h2>${data.name}</h2>
            <div class="name-en">${data.nameEn}</div>
          </div>
          <div class="risk-badge badge-${risk.badge}">${risk.level}</div>
        </div>

        <div class="score-circle-wrap">
          <div class="score-circle" style="--score-color:${risk.color}">
            <div class="score-val">${data.composite.toFixed(1)}</div>
            <div class="score-lab">综合评分</div>
          </div>
        </div>

        <div class="radar-wrap">
          <canvas id="detail-radar" height="240"></canvas>
        </div>

        <div class="indicator-table">
          <div class="ind-title">六项指标明细</div>
          ${renderIndicatorRows(data)}
        </div>

        <div class="data-source">
          <span>📊 数据来源：</span>
          <span>牛津观察指数 (GAIR 2024) · 联合国电子政务调查 (EGDI 2024)</span>
        </div>
      </div>`;

    drawRadarChart("detail-radar", [
      "政府支柱", "技术产业", "数据基础设施",
      "在线服务", "人力资本", "通信基础设施"
    ], [data.gov, data.tech, data.dataInfra, data.online, data.human, data.telecom], risk.color);
  }

  function renderIndicatorRows(data) {
    const rows = [
      { label: "政府支柱得分", value: data.gov, source: "GAIR·政府支柱", desc: "公共部门战略、伦理与制度适应性" },
      { label: "技术产业支柱", value: data.tech, source: "GAIR·技术产业", desc: "本土技术生态与创新能力" },
      { label: "数据基础设施", value: data.dataInfra, source: "GAIR·数据与基础设施", desc: "数据共享平台与基础条件" },
      { label: "在线服务指数", value: data.online, source: "EGDI·在线服务", desc: "公共服务在线供给与整合度" },
      { label: "人力资本指数", value: data.human, source: "EGDI·人力资本", desc: "教育水平与数字人才储备" },
      { label: "通信基础设施", value: data.telecom, source: "EGDI·通信基础设施", desc: "网络覆盖与连接质量" },
    ];
    return rows.map(r => `
      <div class="ind-row">
        <div class="ind-left">
          <div class="ind-label">${r.label}</div>
          <div class="ind-desc">${r.desc}</div>
        </div>
        <div class="ind-right">
          <div class="ind-bar-wrap">
            <div class="ind-bar" style="width:${r.value}%;background:${getBarColor(r.value)}"></div>
          </div>
          <div class="ind-val">${r.value.toFixed(1)}</div>
        </div>
      </div>`).join("");
  }

  // ============================================================
  // 详情面板 — 中国省域
  // ============================================================
  function showDefaultChinaPanel() {
    const panel = document.getElementById("detail-panel");
    const sorted = [...chinaData].sort((a, b) => b.total - a.total);
    const top5 = sorted.slice(0, 5);

    panel.innerHTML = `
      <div class="detail-welcome">
        <div class="welcome-icon">🗺️</div>
        <h3>中国省域数字治理评估</h3>
        <p>中国共有34个省级行政区；本网站当前收录31个省级地区数据。点击省份可查看六维指标与治理建议。</p>
        <div class="stat-row">
          <div class="stat-card"><div class="stat-val">34</div><div class="stat-lab">全国省级行政区</div></div>
          <div class="stat-card"><div class="stat-val">31</div><div class="stat-lab">本站收录省级地区</div></div>
          <div class="stat-card"><div class="stat-val">165</div><div class="stat-lab">跨境电商综试区</div></div>
        </div>
        <div class="top-list">
          <div class="top-title">省域治理能力排名 Top 5</div>
          ${top5.map((p, i) => `
            <div class="top-item" onclick="clickProvinceFromList('${p.name}')">
              <span class="rank">${i + 1}</span>
              <span class="pname">${p.name}</span>
              <div class="bar-mini"><div style="width:${p.total / 100 * 100}%;background:${getProvinceLevel(p.total).color}"></div></div>
              <span class="pscore">${p.total.toFixed(1)}</span>
            </div>`).join("")}
        </div>
      </div>`;
  }

  window.clickProvinceFromList = function (name) {
    const prov = chinaData.find(p => p.name === name);
    if (prov) showProvinceDetail(prov);
  };

  function showProvinceDetail(prov) {
    const panel = document.getElementById("detail-panel");
    const lvl = getProvinceLevel(prov.total);
    const indicators = [
      { label: "网民规模指数", value: prov.internetUsers, desc: "互联网普及水平（每百人）" },
      { label: "宽带用户指数", value: prov.broadband, desc: "固定宽带渗透率（每百户）" },
      { label: "移动电话用户指数", value: prov.mobile, desc: "移动电话密度（每百人）" },
      { label: "数字政府发展指数", value: prov.digitalGov, desc: "综合数字政务能力" },
      { label: "开放度综合指数", value: prov.openness, desc: "公共数据开放与利用（开放数林）" },
      { label: "透明度总分", value: prov.transparency, desc: "政府网络透明度（浙大指数）" },
    ];

    panel.innerHTML = `
      <div class="detail-content fade-in">
        <div class="detail-header">
          <div class="country-name">
            <h2>${prov.name}</h2>
            <div class="name-en">China · Province Data</div>
          </div>
          <div class="risk-badge" style="background:${lvl.color}22;color:${lvl.color};border-color:${lvl.color}44">${lvl.level}</div>
        </div>

        <div class="score-circle-wrap">
          <div class="score-circle" style="--score-color:${lvl.color}">
            <div class="score-val">${prov.total.toFixed(1)}</div>
            <div class="score-lab">综合总分</div>
          </div>
        </div>

        <div class="radar-wrap">
          <canvas id="detail-radar" height="240"></canvas>
        </div>

        <div class="indicator-table">
          <div class="ind-title">六项指标明细</div>
          ${indicators.map(r => `
            <div class="ind-row">
              <div class="ind-left">
                <div class="ind-label">${r.label}</div>
                <div class="ind-desc">${r.desc}</div>
              </div>
              <div class="ind-right">
                <div class="ind-bar-wrap">
                  <div class="ind-bar" style="width:${Math.min(r.value, 100)}%;background:${getBarColor(Math.min(r.value, 100))}"></div>
                </div>
                <div class="ind-val">${r.value.toFixed(1)}</div>
              </div>
            </div>`).join("")}
        </div>

        <div class="problems-section">
          <div class="problems-title">⚠ 主要治理问题</div>
          ${prov.problems.map(p => `<div class="problem-item"><span class="prob-dot">●</span>${p}</div>`).join("")}
        </div>

        <div class="solutions-section">
          <div class="solutions-title">✅ 改进建议</div>
          ${prov.solutions.map((s, i) => `<div class="solution-item"><span class="sol-num">${i + 1}</span>${s}</div>`).join("")}
        </div>

        <div class="data-source">
          <span>📊 数据来源：</span>
          <span>复旦开放数林指数 · 浙大透明度指数 · 清华数字政府指数 · CNNIC · 工信部</span>
        </div>
      </div>`;

    const radarMax = [100, 100, 200, 100, 100, 100];
    const radarVals = [
      (prov.internetUsers / radarMax[0]) * 100,
      (prov.broadband / radarMax[1]) * 100,
      (prov.mobile / radarMax[2]) * 100,
      (prov.digitalGov / radarMax[3]) * 100,
      (prov.openness / radarMax[4]) * 100,
      (prov.transparency / radarMax[5]) * 100,
    ];

    drawRadarChart("detail-radar", [
      "网民规模", "宽带用户", "移动电话",
      "数字政府", "数据开放", "政务透明"
    ], radarVals, lvl.color);
  }

  // ============================================================
  // 雷达图 (Chart.js)
  // ============================================================
  function drawRadarChart(canvasId, labels, values, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (radarChart) { radarChart.destroy(); radarChart = null; }

    radarChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [{
          label: "评分",
          data: values,
          backgroundColor: color + "30",
          borderColor: color,
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: color,
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.label}：${ctx.raw.toFixed(1)}`
            }
          }
        },
        scales: {
          r: {
            min: 0, max: 100,
            ticks: {
              stepSize: 25,
              color: "#6a8ab5",
              font: { size: 9 },
              backdropColor: "transparent"
            },
            grid: { color: "#1e3a6a" },
            angleLines: { color: "#1e3a6a" },
            pointLabels: {
              color: "#9ab6d4",
              font: { size: 11 }
            }
          }
        }
      }
    });
  }

  // ============================================================
  // 辅助函数
  // ============================================================
  function getBarColor(val) {
    if (val >= 80) return "#27ae60";
    if (val >= 65) return "#3498db";
    if (val >= 50) return "#f39c12";
    return "#e74c3c";
  }

  // 搜索功能
  window.handleSearch = function () {
    const q = document.getElementById("search-input").value.trim().toLowerCase();
    if (!q) return;

    if (currentTab === "world") {
      const found = worldData.find(d =>
        d.name.toLowerCase().includes(q) ||
        d.nameEn.toLowerCase().includes(q)
      );
      if (found) {
        showCountryDetail(found);
        document.getElementById("search-tip").textContent = `已找到：${found.name} (${found.nameEn})`;
      } else {
        document.getElementById("search-tip").textContent = "未找到匹配国家，请尝试其他关键词";
      }
    } else {
      const found = chinaData.find(p =>
        p.name.includes(q) || p.name.toLowerCase().includes(q)
      );
      if (found) {
        showProvinceDetail(found);
        document.getElementById("search-tip").textContent = `已找到：${found.name}`;
      } else {
        document.getElementById("search-tip").textContent = "未找到匹配省份";
      }
    }
  };

  document.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const searchInput = document.getElementById("search-input");
      if (document.activeElement === searchInput) handleSearch();
    }
  });

})();
