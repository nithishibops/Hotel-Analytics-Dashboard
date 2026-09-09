
const pages = {
  1:"1. EXECUTIVE OVERVIEW",
  2:"2. BOOKING ANALYTICS",
  3:"3. REVENUE & OPERATIONS",
  4:"4. GUEST EXPERIENCE"
};
const buttons=[...document.querySelectorAll(".nav-item")];
const sections=[...document.querySelectorAll(".page")];
const title=document.getElementById("page-title");

function switchPage(n){
  document.body.dataset.page=n;
  buttons.forEach(b=>b.classList.toggle("active",b.dataset.page===String(n)));
  sections.forEach(s=>s.classList.toggle("active",s.id==="page-"+n));
  title.textContent=pages[n];
  clearSelection(false);
  window.scrollTo({top:0,behavior:"smooth"});
}
buttons.forEach(btn=>{
  btn.addEventListener("click",()=>switchPage(btn.dataset.page));
  btn.addEventListener("touchend",(e)=>{e.preventDefault();switchPage(btn.dataset.page);},{passive:false});
});
document.addEventListener("keydown",(e)=>{
  const current=Number(document.body.dataset.page||1);
  if(e.key==="ArrowRight" && current<4) switchPage(current+1);
  if(e.key==="ArrowLeft" && current>1) switchPage(current-1);
  if(e.key==="Escape") clearSelection();
});

// Heatmap
const heatmap=document.getElementById("heatmap");
if(heatmap && !heatmap.children.length){
  const months=["Country","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const rows=[
    ["Italy",72,73,79,82,69,75,78,71,76,58,53,74],
    ["Australia",85,86,83,94,116,84,95,82,105,92,94,95],
    ["Spain",111,88,117,100,97,106,88,84,88,95,97,98],
    ["France",109,92,102,99,96,87,113,76,105,95,92,105],
    ["Singapore",98,92,80,110,115,119,98,92,105,99,101,97],
    ["UK",201,184,192,176,220,214,198,191,175,206,213,209],
    ["USA",426,370,386,411,383,388,408,407,404,399,395,385]
  ];
  months.forEach(m=>{const s=document.createElement("span");s.textContent=m;s.className="head";heatmap.appendChild(s)});
  rows.forEach(r=>{
    r.forEach((v,i)=>{
      const s=document.createElement("span");s.textContent=v;
      if(i===0)s.className="country";
      else{
        const num=Number(v), a=Math.max(.18,Math.min(.9,num/450));
        s.style.background=`rgba(36,210,109,${a})`;
        s.classList.add("interactive-cell");
        s.dataset.detail=`${r[0]} • ${months[i]} • Occupancy: ${v}`;
        s.dataset.value=num;
      }
      heatmap.appendChild(s);
    });
  });
}

// Floating tooltip
const tooltip=document.createElement("div");
tooltip.className="chart-tooltip";
tooltip.innerHTML="<b></b><span></span>";
document.body.appendChild(tooltip);
function showTooltip(x,y,title,text){
  tooltip.querySelector("b").textContent=title;
  tooltip.querySelector("span").textContent=text;
  tooltip.style.left=Math.min(window.innerWidth-170,x+12)+"px";
  tooltip.style.top=Math.max(8,y-54)+"px";
  tooltip.classList.add("show");
}
function hideTooltip(){tooltip.classList.remove("show")}

// Bottom detail sheet
function createInfoPanel(){
  const panel=document.createElement("div");
  panel.id="dash-info-panel";
  panel.innerHTML=`
    <div class="info-sheet" role="dialog" aria-modal="true" aria-labelledby="info-title">
      <button class="info-close" aria-label="Close">×</button>
      <div class="info-kicker">INTERACTIVE DETAIL</div>
      <h3 id="info-title">Dashboard Detail</h3>
      <p id="info-copy"></p>
    </div>`;
  document.body.appendChild(panel);
  panel.addEventListener("click",(e)=>{if(e.target===panel||e.target.closest(".info-close")) panel.classList.remove("open")});
  return panel;
}
const infoPanel=createInfoPanel();
function showInfo(t,copy){
  infoPanel.querySelector("#info-title").textContent=t;
  infoPanel.querySelector("#info-copy").textContent=copy;
  infoPanel.classList.add("open");
}

// Static dashboard data, matching current visuals.
const details={
 "Total Bookings":"20K total hotel bookings • 46.03% above previous year.",
 "Occupancy Rate":"60% occupancy rate • 45.99% above previous year.",
 "Total Revenue":"$17M total revenue • 46.35% above previous year.",
 "Cancellation Rate":"8.41% cancellation rate • down 45.10% versus previous year.",
 "Total Guests":"56,683 guests • 45.83% above previous year.",
 "Net Revenue":"$17M net revenue • 46.40% above previous year.",
 "OTA Booking":"4.01K OTA bookings • 46.17% above previous year.",
 "Website Bookings":"7.04K direct website bookings • 46.76% above previous year.",
 "Repeat Customers":"1.93K repeat customers • 102.85% above previous year.",
 "Food Revenue":"$3.95M food revenue • 46.77% above previous year.",
 "Room Revenue":"$12.3M room revenue • 46.20% above previous year.",
 "Spa Revenue":"$387K spa revenue • 48.34% above previous year.",
 "Average Room Rate":"$287.13 average room rate • previous year $288.17.",
 "Rating":"3.80/5 average guest rating.",
 "Review Score":"7.04/10 average review score.",
 "Complaint Rating":"31.57% complaint rating • down 3.24% versus previous year.",
 "Staff Rating":"4.04/5 average staff rating."
};

const series={
 "Revenue Trend (Monthly)":{labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],values:["1.53M","1.28M","1.36M","1.43M","1.54M","1.54M","1.59M","1.45M","1.32M","1.33M","1.41M","1.56M"]},
 "Occupancy Rate Trend":{labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],values:["3.4%","3.0%","3.3%","3.5%","3.5%","3.4%","3.4%","3.4%","3.3%","3.4%","3.4%","4.3%"]},
 "Booking Trend (Monthly)":{labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],values:["1725","1526","1661","1693","1722","1675","1652","1639","1670","1656","1683","1698"]},
 "Room Rate Trend (Monthly)":{labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],values:["300","293","278","268","274","295","330","314","289","250","254","318"]}
};

let selectedElements=[];
function clearSelection(closeInfo=true){
  document.querySelectorAll(".cross-dim,.cross-focus,.data-active").forEach(el=>{
    el.classList.remove("cross-dim","cross-focus","data-active");
  });
  document.querySelectorAll(".legend-off").forEach(el=>el.classList.remove("legend-off"));
  selectedElements=[];
  if(closeInfo) infoPanel?.classList.remove("open");
  document.getElementById("filter-status").textContent="Interactive mode • All data";
}
function crossHighlight(target,label){
  const page=target.closest(".page");
  if(!page)return;
  page.querySelectorAll(".kpi,.panel").forEach(el=>el.classList.add("cross-dim"));
  const panel=target.closest(".panel,.kpi");
  if(panel){panel.classList.remove("cross-dim");panel.classList.add("cross-focus")}
  target.classList.add("data-active");
  document.getElementById("filter-status").textContent="Selected • "+label;
}

// KPI interactions
document.querySelectorAll(".kpi").forEach(card=>{
  card.setAttribute("tabindex","0");card.setAttribute("role","button");
  const label=card.querySelector("span")?.textContent.trim()||"KPI";
  const value=card.querySelector("strong")?.textContent.trim()||"";
  const change=card.querySelector("small")?.textContent.trim()||"";
  const activate=()=>{
    crossHighlight(card,label);
    showInfo(label,details[label]||`${label}: ${value}${change?" • "+change:""}`);
  };
  card.addEventListener("click",activate);
  card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();activate()}});
});

// SVG chart interactivity: nearest month tooltip + selection
document.querySelectorAll(".panel").forEach(panel=>{
  const heading=panel.querySelector("h2")?.textContent.trim();
  const svg=panel.querySelector("svg.chart");
  if(svg && series[heading]){
    const s=series[heading];
    const handle=(clientX,clientY,commit=false)=>{
      const rect=svg.getBoundingClientRect();
      const ratio=Math.max(0,Math.min(.999,(clientX-rect.left)/rect.width));
      const idx=Math.min(s.labels.length-1,Math.floor(ratio*s.labels.length));
      showTooltip(clientX,clientY,heading,`${s.labels[idx]} • ${s.values[idx]}`);
      if(commit){
        crossHighlight(svg,`${heading} • ${s.labels[idx]}`);
        showInfo(heading,`${s.labels[idx]} • ${s.values[idx]}`);
      }
    };
    svg.addEventListener("mousemove",e=>handle(e.clientX,e.clientY,false));
    svg.addEventListener("mouseleave",hideTooltip);
    svg.addEventListener("click",e=>handle(e.clientX,e.clientY,true));
    svg.addEventListener("touchend",e=>{
      const t=e.changedTouches?.[0]; if(t) handle(t.clientX,t.clientY,true);
    },{passive:true});
  }
});

// Bars / columns
document.querySelectorAll(".bar-list div,.h-bars div,.column-chart b,.manager-chart b,.mini-bars-line b").forEach(el=>{
  el.addEventListener("mouseenter",e=>{
    const panel=el.closest(".panel"); const heading=panel?.querySelector("h2")?.textContent||"Value";
    showTooltip(e.clientX,e.clientY,heading,el.innerText.replace(/\s+/g," ").trim());
  });
  el.addEventListener("mouseleave",hideTooltip);
  el.addEventListener("click",e=>{
    e.stopPropagation();
    const panel=el.closest(".panel"), heading=panel?.querySelector("h2")?.textContent||"Value";
    const txt=el.innerText.replace(/\s+/g," ").trim();
    crossHighlight(el,txt);
    showInfo(heading,txt);
  });
});

// Donuts + legend toggles
document.querySelectorAll(".panel").forEach(panel=>{
  const heading=panel.querySelector("h2")?.textContent.trim()||"Distribution";
  const donut=panel.querySelector(".donut");
  const legend=[...panel.querySelectorAll(".legend span")];
  if(donut){
    donut.addEventListener("click",()=>{
      crossHighlight(donut,heading);
      showInfo(heading,legend.map(x=>x.textContent.trim()).join(" • "));
    });
    legend.forEach(item=>{
      item.addEventListener("click",e=>{
        e.stopPropagation();
        item.classList.toggle("legend-off");
        const active=legend.filter(x=>!x.classList.contains("legend-off")).map(x=>x.textContent.trim());
        document.getElementById("filter-status").textContent=`${heading} • ${active.length}/${legend.length} categories visible`;
      });
    });
  }
});

// Heatmap cells
document.addEventListener("click",e=>{
  const cell=e.target.closest(".interactive-cell");
  if(cell){
    crossHighlight(cell,cell.dataset.detail);
    showInfo("Occupancy Heatmap",cell.dataset.detail);
  }
});
document.addEventListener("mouseover",e=>{
  const cell=e.target.closest(".interactive-cell");
  if(cell)showTooltip(e.clientX,e.clientY,"Occupancy Heatmap",cell.dataset.detail);
});
document.addEventListener("mouseout",e=>{if(e.target.closest?.(".interactive-cell"))hideTooltip()});

// Revenue map
document.querySelectorAll(".revenue-map-img").forEach(map=>{
  map.addEventListener("click",()=>{
    crossHighlight(map,"Revenue by City");
    showInfo("Revenue by City","City revenue map selected. Highlighted locations represent revenue-generating hotel markets shown in the original dashboard.");
  });
});

// Date chips behave as selectable slicer endpoints
const dateChips=[...document.querySelectorAll(".date-chip")];
dateChips.forEach(chip=>{
  chip.addEventListener("click",()=>{
    dateChips.forEach(x=>x.classList.remove("active-date"));
    chip.classList.add("active-date");
    document.getElementById("filter-status").textContent="Date slicer • "+chip.textContent.trim();
    showInfo("Date Slicer",`Selected dashboard date: ${chip.textContent.trim()}. The web version preserves the original Power BI date range display.`);
  });
});

// Filter toolbar: visual filtering without changing the underlying design.
const filterPills=[...document.querySelectorAll(".filter-pill")];
function classifyValue(el){
  const txt=el.innerText||"";
  const m=txt.match(/(\d+(?:\.\d+)?)/);
  if(!m)return "medium";
  const n=parseFloat(m[1]);
  if(n>=100 || /M|K/.test(txt)) return "high";
  if(n<10) return "low";
  return "medium";
}
filterPills.forEach(btn=>{
  btn.addEventListener("click",()=>{
    filterPills.forEach(x=>x.classList.toggle("active",x===btn));
    clearSelection(false);
    const f=btn.dataset.filter;
    document.querySelectorAll(".page.active .kpi").forEach(k=>{
      k.style.opacity=(f==="all"||classifyValue(k)===f)?"1":".28";
    });
    document.getElementById("filter-status").textContent=f==="all"?"Interactive mode • All data":`Quick filter • ${f[0].toUpperCase()+f.slice(1)} values`;
  });
});

document.getElementById("reset-dashboard")?.addEventListener("click",()=>{
  document.querySelectorAll(".kpi").forEach(k=>k.style.opacity="1");
  filterPills.forEach(x=>x.classList.toggle("active",x.dataset.filter==="all"));
  dateChips.forEach(x=>x.classList.remove("active-date"));
  clearSelection();
});

// Hint
const hint=document.createElement("div");
hint.className="interaction-hint";
hint.textContent="Click/tap visuals • Hover for values • Click legends to toggle";
document.body.appendChild(hint);
setTimeout(()=>hint.classList.add("show"),350);
setTimeout(()=>hint.classList.remove("show"),5200);
