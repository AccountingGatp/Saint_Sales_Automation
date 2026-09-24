(() => {
  'use strict';

  const E = window.SaintSalesEngine;
  const BASE_CONFIG = window.SAINT_SALES_BASE_CONFIG;
  const $ = id => document.getElementById(id);
  const money = n => new Intl.NumberFormat('en-AU',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  if (!E) throw new Error('Sales calculation engine could not be loaded.');
  if (!BASE_CONFIG) throw new Error('Saint accounting configuration could not be loaded.');

  let raw = { net:null, sales:null, gateway:null };
  let result = null;

  function deepMerge(base, extra){
    if(!extra || typeof extra !== 'object') return base;
    Object.keys(extra).forEach(k=>{
      const v = extra[k];
      if(v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) deepMerge(base[k],v);
      else base[k] = v;
    });
    return base;
  }
  const clone = x => JSON.parse(JSON.stringify(x));
  const normalizedConfig = extra => deepMerge(clone(BASE_CONFIG), extra || {});
  const STORAGE_KEY = 'saintSalesConfigV4';
  const LEGACY_STORAGE_KEY = 'saintSalesConfigV3';

  function isPlainObject(v){ return !!v && typeof v === 'object' && !Array.isArray(v); }
  function configDiff(base,current){
    if(!isPlainObject(current)) return current;
    const out={};
    Object.keys(current).forEach(k=>{
      const cv=current[k], bv=isPlainObject(base) ? base[k] : undefined;
      if(isPlainObject(cv)){
        const nested=configDiff(isPlainObject(bv)?bv:{},cv);
        if(Object.keys(nested).length) out[k]=nested;
      }else if(JSON.stringify(cv)!==JSON.stringify(bv)) out[k]=cv;
    });
    return out;
  }
  function loadConfig(){
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if(saved) return normalizedConfig(JSON.parse(saved));

      // One-time migration from the older full-config storage format. Only the
      // differences from the current shipped configuration are kept as user overrides.
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if(legacy){
        const legacyConfig=normalizedConfig(JSON.parse(legacy));
        const overrides=configDiff(BASE_CONFIG,legacyConfig);
        localStorage.setItem(STORAGE_KEY,JSON.stringify(overrides));
        return normalizedConfig(overrides);
      }
      return normalizedConfig(null);
    } catch(_) { return normalizedConfig(null); }
  }
  let config = loadConfig();
  function saveConfig(){
    // Store only user-entered overrides/new GL mappings. This prevents an old saved
    // copy of the whole config from overriding future shipped corrections next week.
    // localStorage survives browser close and PC shutdown on the same browser/site.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configDiff(BASE_CONFIG,config)));
  }

  function invalidateResult(){
    result = null;
    $('results').classList.add('hidden');
  }

  function resetUploadUI(kind){
    const zone = document.querySelector(`.dropzone[data-kind="${kind}"]`);
    if(!zone) return;
    zone.classList.remove('uploaded','dragover');
    zone.querySelector('.drop-icon').textContent = '↑';
    zone.querySelector('.drop-title').textContent = 'Drop CSV here or click to browse';
    const status = $(zone.dataset.status);
    status.textContent = 'No file selected';
    zone.querySelector('.remove-file').classList.add('hidden');
  }

  function markUploaded(kind, file, rowCount){
    const zone = document.querySelector(`.dropzone[data-kind="${kind}"]`);
    zone.classList.add('uploaded');
    zone.classList.remove('dragover');
    zone.querySelector('.drop-icon').textContent = '✓';
    zone.querySelector('.drop-title').textContent = 'File uploaded';
    $(zone.dataset.status).textContent = `${file.name} · ${rowCount.toLocaleString()} rows`;
    zone.querySelector('.remove-file').classList.remove('hidden');
  }

  async function readCsvFile(file, kind){
    hideMessages();
    invalidateResult();
    if(!file) return;
    if(!/\.csv$/i.test(file.name || '')){
      raw[kind] = null;
      resetUploadUI(kind);
      showError('Only CSV files are supported for Shopify reports.');
      return;
    }
    try{
      const rows = E.parseCSV(await file.text());
      if(!rows.length) throw new Error('The selected CSV has no data rows.');
      raw[kind] = rows;
      markUploaded(kind,file,rows.length);
    }catch(err){
      raw[kind] = null;
      resetUploadUI(kind);
      showError(err.message || String(err));
    }
  }

  function removeFile(kind){
    const zone = document.querySelector(`.dropzone[data-kind="${kind}"]`);
    const input = $(zone.dataset.input);
    input.value = '';
    raw[kind] = null;
    resetUploadUI(kind);
    invalidateResult();
    hideMessages();
  }

  // Prevent the browser from navigating to a dropped file outside a drop zone.
  window.addEventListener('dragover', e => e.preventDefault());
  window.addEventListener('drop', e => e.preventDefault());

  document.querySelectorAll('.dropzone[data-input]').forEach(zone=>{
    const input = $(zone.dataset.input);
    const kind = zone.dataset.kind;

    input.addEventListener('change', () => readCsvFile(input.files && input.files[0], kind));

    zone.addEventListener('click', e=>{
      if(e.target.closest('.remove-file')) return;
      input.click();
    });
    zone.addEventListener('keydown', e=>{
      if((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.remove-file')){
        e.preventDefault();
        input.click();
      }
    });
    zone.addEventListener('dragenter', e=>{ e.preventDefault(); e.stopPropagation(); zone.classList.add('dragover'); });
    zone.addEventListener('dragover', e=>{ e.preventDefault(); e.stopPropagation(); if(e.dataTransfer) e.dataTransfer.dropEffect='copy'; zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', e=>{ e.preventDefault(); e.stopPropagation(); if(!zone.contains(e.relatedTarget)) zone.classList.remove('dragover'); });
    zone.addEventListener('drop', e=>{
      e.preventDefault(); e.stopPropagation(); zone.classList.remove('dragover');
      const files = Array.from((e.dataTransfer && e.dataTransfer.files) || []);
      if(!files.length) return;
      if(files.length !== 1){ showError('Drop one CSV file into each upload box.'); return; }
      readCsvFile(files[0],kind);
    });
    zone.querySelector('.remove-file').addEventListener('click', e=>{
      e.preventDefault(); e.stopPropagation(); removeFile(kind);
    });
  });

  $('processBtn').addEventListener('click', process);

  function process(){
    hideMessages();
    const reviewAction=$('reviewActionMsg');
    if(reviewAction){ reviewAction.textContent=''; reviewAction.classList.add('hidden'); }
    if(!raw.net || !raw.sales){
      showError('Upload both required files: Net payments by order and Total sales by order.');
      return;
    }
    try{
      result = E.process(raw.net,raw.sales,raw.gateway,config);
      $('results').classList.remove('hidden');
      renderAll();
      // Result status, review guidance and download readiness are shown together in the Review/Download area.
    }catch(err){
      invalidateResult();
      showError(err.message || String(err));
    }
  }

  function renderAll(){
    const m = result.metrics;
    const reviewRows = result.audits.filter(a=>a.severity === 'ERROR' || a.severity === 'REVIEW');
    const errorCount = reviewRows.filter(a=>a.severity === 'ERROR').length;
    const reviewCount = reviewRows.length;

    $('processMeta').textContent = `Processed ${formatReviewDate(m.startDate)} to ${formatReviewDate(m.endDate)}${m.journalBalanced ? ' · Journal balanced' : ' · Journal needs attention'}`;

    const pill=$('reviewStatusPill');
    const banner=$('reviewBanner');
    const notice=$('downloadNotice');
    pill.className='status-pill';
    banner.className='review-banner';
    notice.className='download-notice';

    if(!reviewCount){
      pill.textContent='Ready'; pill.classList.add('ready');
      banner.textContent='No review is required. The processed files are ready to download.'; banner.classList.add('ready');
      notice.textContent='Ready to download. No review items remain.'; notice.classList.add('ready');
    }else if(errorCount){
      pill.textContent=`${reviewCount} item${reviewCount===1?'':'s'}`; pill.classList.add('error');
      banner.textContent=`${reviewCount} item${reviewCount===1?'':'s'} need attention. Fix any missing values below where possible. Saving a value automatically reprocesses all outputs.`; banner.classList.add('error');
      notice.textContent=`Downloads are available, but ${reviewCount} review/error item${reviewCount===1?'':'s'} remain. Use the files for checking; resolve the items above before posting the Xero journal.`; notice.classList.add('error');
    }else{
      pill.textContent=`${reviewCount} review`; pill.classList.add('review');
      banner.textContent=`${reviewCount} review item${reviewCount===1?'':'s'} found. Enter only the missing value shown below. Saving it automatically reprocesses all outputs.`; banner.classList.add('review');
      notice.textContent=`Downloads are available. ${reviewCount} review item${reviewCount===1?'':'s'} remain; resolve them above before posting the Xero journal.`; notice.classList.add('review');
    }

    // Downloads must stay available even when a review item remains.
    $('xeroBtn').disabled = false;
    $('xeroBtn').title = reviewCount ? 'Download current Xero CSV. Resolve review items before posting it to Xero.' : 'Download Xero import CSV';

    renderTable('recTable',result.reconciliationRows,result.reconciliationColumns,{money:true});
    renderTable('summaryTable',result.summaryRows,['Country','Total Sales Revenue','Total Shipping','Total Other Tax','Total Refunds'],{money:true});
    renderTable('journalTable',result.journalRows,['Date','Account Code','Description','Debit','Credit'],{moneyCols:new Set(['Debit','Credit'])});
    renderTable('xeroTable',result.xeroRows,['*Narration','*Date','Description','*AccountCode','*TaxRate','*Amount','TrackingName1','TrackingOption1','TrackingName2','TrackingOption2'],{moneyCols:new Set(['*Amount'])});
    renderAudit(reviewRows);
    renderMappings();
  }

  let reviewFixes = new Map();

  function formatReviewDate(v){
    const s=String(v||'');
    const m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : s;
  }

  function reviewFixKey(fix){
    if(!fix || !fix.type) return '';
    if(fix.type==='gateway') return `gateway|${fix.gateway||''}`;
    return `${fix.type}|${fix.country||''}`;
  }

  function reviewFixMeta(fix){
    if(!fix) return null;
    if(fix.type==='gateway'){
      const name=fix.gateway||'Gateway';
      return {title:`${name} clearing GL`,label:'Clearing GL',placeholder:'Enter GL account',current:(config.gateways[name]||{}).accountCode??''};
    }
    const country=fix.country||'Country';
    const c=(config.countries&&config.countries[country])||{};
    if(fix.type==='countryRefund') return {title:`${country} refund GL`,label:'Refund GL',placeholder:'Enter refund GL',current:c.refundAccount??''};
    if(fix.type==='countryTax') return {title:`${country} other-tax GL`,label:'Other Tax GL',placeholder:'Enter tax GL',current:c.taxAccount??''};
    if(fix.type==='countryRevenue') return {title:`${country} revenue GL`,label:'Revenue GL',placeholder:'Enter revenue GL',current:c.revenueAccount??''};
    return null;
  }

  function renderAudit(rows){
    reviewFixes = new Map();
    if(!rows.length){
      $('auditTable').innerHTML = '';
      return;
    }

    const grouped=new Map(), other=[];
    rows.forEach(a=>{
      const key=reviewFixKey(a.fix);
      const meta=reviewFixMeta(a.fix);
      if(!key || !meta){ other.push(a); return; }
      if(!grouped.has(key)) grouped.set(key,{fix:a.fix,meta,rows:[]});
      grouped.get(key).rows.push(a);
    });

    let html='';
    if(grouped.size){
      html += '<div class="review-resolve-head"><strong>Missing accounting values</strong><span>Enter only the missing GL account.</span></div>';
      html += '<div class="review-resolve-table"><table><thead><tr><th>Issue</th><th>Affected</th><th>Required value</th><th></th></tr></thead><tbody>';
      let i=0;
      grouped.forEach(group=>{
        const id=`fix-${i++}`;
        reviewFixes.set(id,group.fix);
        const dates=[...new Set(group.rows.map(x=>x.date).filter(Boolean))].map(formatReviewDate);
        const affected=dates.length ? dates.join(', ') : 'Current file';
        html += `<tr><td class="left"><strong>${esc(group.meta.title)}</strong></td><td class="left review-affected">${esc(affected)}</td><td class="left"><label class="sr-only" for="${id}">${esc(group.meta.label)}</label><input id="${id}" class="review-fix-input" inputmode="numeric" autocomplete="off" placeholder="${esc(group.meta.placeholder)}" value="${esc(group.meta.current)}"></td><td><button class="resolve-review primary" data-fix-id="${id}" type="button">Save</button></td></tr>`;
      });
      html += '</tbody></table></div>';
    }

    if(other.length){
      html += `<div class="review-other-head"><strong>${grouped.size ? 'Other items requiring review' : 'Items requiring review'}</strong><span>These items come from source-file or reconciliation checks and cannot be solved by entering a GL.</span></div>`;
      html += '<div class="review-other-table"><table><thead><tr><th>Status</th><th>Category</th><th>Context</th><th>Message</th></tr></thead><tbody>';
      other.forEach(a=>{
        const context=[a.date?formatReviewDate(a.date):'',a.order||'',a.country||''].filter(Boolean).join(' · ');
        html += `<tr><td>${badge(a.severity)}</td><td class="left">${esc(a.category||'')}</td><td class="left">${esc(context||'—')}</td><td class="left review-message">${esc(a.message||'')}</td></tr>`;
      });
      html += '</tbody></table></div>';
    }
    $('auditTable').innerHTML=html;
  }

  function applyReviewFix(fix,accountRaw){
    const value=String(accountRaw==null?'':accountRaw).trim();
    if(!/^\d+$/.test(value)) throw new Error('Enter a valid numeric GL account code.');
    const account=Number(value);
    if(fix.type==='gateway'){
      const name=fix.gateway;
      if(!name) throw new Error('Gateway name is missing.');
      const g=config.gateways[name]||(config.gateways[name]={});
      g.accountCode=account;
      if(!g.journalDescription) g.journalDescription=`${name} Clearing Account`;
      if(!g.xeroDescription) g.xeroDescription=`${name} Clearing`;
      if(!g.taxRate) g.taxRate='BAS Excluded';
      if(!Array.isArray(g.aliases) || !g.aliases.length) g.aliases=[String(name).toLowerCase()];
      return `${name} clearing GL`;
    }
    const country=fix.country;
    if(!country) throw new Error('Country is missing.');
    const c=config.countries[country]||(config.countries[country]={});
    if(fix.type==='countryRefund'){
      c.refundAccount=account;
      if(!c.refundDescription) c.refundDescription=`${config.fallbackRefund.descriptionPrefix||'Refunds'} - ${country}`;
      if(!c.refundTaxRate) c.refundTaxRate=config.fallbackRefund.taxRate||'BAS Excluded';
      return `${country} refund GL`;
    }
    if(fix.type==='countryTax'){
      c.taxAccount=account;
      if(!c.taxDescription) c.taxDescription=`${config.fallbackOtherTax.descriptionPrefix||'Other Tax'} - ${country}`;
      if(!c.taxRate) c.taxRate=config.fallbackOtherTax.taxRate||'BAS Excluded';
      return `${country} other-tax GL`;
    }
    if(fix.type==='countryRevenue'){
      c.revenueAccount=account;
      if(!c.revenueDescription || /\bother\b/i.test(c.revenueDescription)) c.revenueDescription=`Product Revenue - ${country}`;
      if(!c.revenueTaxRate) c.revenueTaxRate=config.fallbackRevenue.taxRate||'BAS Excluded';
      return `${country} revenue GL`;
    }
    throw new Error('This review item does not support an inline fix.');
  }

  $('auditTable').addEventListener('click',e=>{
    const btn=e.target.closest('.resolve-review');
    if(!btn) return;
    const id=btn.dataset.fixId;
    const fix=reviewFixes.get(id);
    const inp=$(id);
    if(!fix || !inp) return;
    try{
      const label=applyReviewFix(fix,inp.value);
      saveConfig();
      process();
      const action=$('reviewActionMsg');
      action.textContent = `${label} saved for future files on this browser. All outputs were reprocessed automatically.`;
      action.classList.remove('hidden');
    }catch(err){ showError(err.message||String(err)); inp.focus(); }
  });

  function badge(v){
    const x = String(v || '').toUpperCase();
    const cls = x === 'PASS' ? 'pass' : x === 'ERROR' ? 'err' : x === 'REVIEW' ? 'review' : 'info';
    return `<span class="badge ${cls}">${esc(x)}</span>`;
  }

  function renderTable(id,rows,cols,opts={}){
    const el = $(id);
    if(!rows || !rows.length){ el.innerHTML = '<div class="empty-state">No rows.</div>'; return; }
    const moneyCols = opts.moneyCols || new Set();
    let html = '<table><thead><tr>'+cols.map(c=>`<th>${esc(c)}</th>`).join('')+'</tr></thead><tbody>';
    rows.forEach(r=>{
      html += '<tr>'+cols.map(c=>{
        let v = r[c];
        if(opts.statusCol === c) return `<td>${badge(v)}</td>`;
        const numeric = typeof v === 'number' && Number.isFinite(v);
        if(numeric && (opts.money || moneyCols.has(c))) v = money(v);
        return `<td class="${numeric ? '' : 'left'}">${esc(v)}</td>`;
      }).join('')+'</tr>';
    });
    el.innerHTML = html+'</tbody></table>';
  }

  function input(path,value,cls=''){ return `<input class="map-input ${cls}" data-path="${esc(path)}" value="${esc(value == null ? '' : value)}">`; }
  function pathKey(v){ return encodeURIComponent(String(v)).replace(/\./g,'%2E'); }

  function renderMappings(){ renderCoreMap(); renderGatewayMap(); renderCountryMap(); }

  function renderCoreMap(){
    const rows = [
      ['Australia Refund','australia.refund',config.australia.refund],
      ['Australia Shipping','australia.shipping',config.australia.shipping],
      ['Australia Revenue','australia.revenue',config.australia.revenue],
      ['GST','gst',config.gst],['Export Shipping','exportShipping',config.exportShipping],
      ['Rounding','rounding',config.rounding]
    ];
    let h='<table><thead><tr><th>Mapping</th><th>Account</th><th>Description</th><th>Tax Rate</th></tr></thead><tbody>';
    rows.forEach(([name,path,obj])=>{
      const desc = obj.description || obj.descriptionPrefix || '';
      h += `<tr><td>${esc(name)}</td><td>${input(path+'.accountCode',obj.accountCode)}</td><td>${input(path+(obj.description !== undefined ? '.description' : '.descriptionPrefix'),desc,'desc')}</td><td>${input(path+'.taxRate',obj.taxRate||'')}</td></tr>`;
    });
    h += '</tbody></table>';
    h += `<div class="config-note">Australia GST rate: ${input('settings.australiaGstRate',config.settings.australiaGstRate)} &nbsp; Maximum automatic rounding: ${input('settings.maxRounding',config.settings.maxRounding)}</div>`;
    $('coreMap').innerHTML = h;
  }

  function renderGatewayMap(){
    let h='<table><thead><tr><th>Gateway</th><th>Account</th><th>Journal description</th><th>Xero description</th><th>Tax rate</th></tr></thead><tbody>';
    const detected = result ? result.detectedGateways : [];
    const keys = [...new Set([...Object.keys(config.gateways||{}),...detected])];
    keys.sort((a,b)=>{
      const ma=config.gateways[a]||{}, mb=config.gateways[b]||{};
      return (ma.reportOrder??900)-(mb.reportOrder??900) || a.localeCompare(b);
    }).forEach(g=>{
      const m=config.gateways[g]||{};
      h += `<tr><td>${esc(g)}</td><td>${input(`gateways.${pathKey(g)}.accountCode`,m.accountCode??'')}</td><td>${input(`gateways.${pathKey(g)}.journalDescription`,m.journalDescription||`${g} Clearing Account`,'desc')}</td><td>${input(`gateways.${pathKey(g)}.xeroDescription`,m.xeroDescription||`${g} Clearing`,'desc')}</td><td>${input(`gateways.${pathKey(g)}.taxRate`,m.taxRate||'BAS Excluded')}</td></tr>`;
    });
    $('gatewayMap').innerHTML = h+'</tbody></table>';
  }

  function renderCountryMap(){
    if(!result){ $('countryMap').innerHTML='<div class="empty-state">Process files to show countries used in this period.</div>'; return; }
    let h='<table><thead><tr><th>Country</th><th>Revenue GL</th><th>Revenue description</th><th>Refund GL</th><th>Refund description</th><th>Other tax GL</th><th>Other tax description</th></tr></thead><tbody>';
    result.countries.forEach(c=>{
      const m=config.countries[c]||{};
      h += `<tr><td>${esc(c)}</td><td>${input(`countries.${pathKey(c)}.revenueAccount`,m.revenueAccount??'')}</td><td>${input(`countries.${pathKey(c)}.revenueDescription`,m.revenueDescription||`Product Revenue - ${c}`,'desc')}</td><td>${input(`countries.${pathKey(c)}.refundAccount`,m.refundAccount??'')}</td><td>${input(`countries.${pathKey(c)}.refundDescription`,m.refundDescription||`Refunds - ${c}`,'desc')}</td><td>${input(`countries.${pathKey(c)}.taxAccount`,m.taxAccount??'')}</td><td>${input(`countries.${pathKey(c)}.taxDescription`,m.taxDescription||`Other Tax - ${c}`,'desc')}</td></tr>`;
    });
    $('countryMap').innerHTML = h+'</tbody></table>';
  }

  function setPath(obj,path,val){
    const parts=path.split('.').map(p=>decodeURIComponent(p));
    let x=obj;
    for(let i=0;i<parts.length-1;i++){ if(!x[parts[i]] || typeof x[parts[i]]!=='object') x[parts[i]]={}; x=x[parts[i]]; }
    const key=parts[parts.length-1];
    if((/account|order/i.test(key) || key==='maxRounding' || key==='australiaGstRate') && val!=='') x[key]=Number(val);
    else x[key]=val;
  }

  $('saveMappingBtn').addEventListener('click',()=>{
    document.querySelectorAll('.map-input').forEach(inp=>setPath(config,inp.dataset.path,inp.value));
    saveConfig();
    if(raw.net && raw.sales) process();
    else showOk('Settings saved.');
  });
  $('resetMappingBtn').addEventListener('click',()=>{
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    config=normalizedConfig(null);
    if(raw.net && raw.sales) process(); else renderMappings();
  });
  $('exportMappingBtn').addEventListener('click',()=>downloadText('saint-sales-mapping.json',JSON.stringify(config,null,2),'application/json;charset=utf-8'));
  $('importMappingBtn').addEventListener('click',()=>$('importMappingFile').click());
  $('importMappingFile').addEventListener('change',async()=>{
    const f=$('importMappingFile').files && $('importMappingFile').files[0];
    if(!f) return;
    try{
      const parsed=JSON.parse(await f.text());
      if(!parsed || typeof parsed!=='object') throw new Error('Invalid mapping JSON.');
      config=normalizedConfig(parsed); saveConfig();
      if(raw.net && raw.sales) process(); else renderMappings();
      showOk('Settings imported.');
    }catch(err){ showError(`Could not import settings: ${err.message||err}`); }
    finally{ $('importMappingFile').value=''; }
  });

  document.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    $('panel-'+btn.dataset.tab).classList.add('active');
  }));

  function downloadText(filename,text,type='text/csv;charset=utf-8'){
    const blob=new Blob([text],{type});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },300);
  }

  $('recBtn').addEventListener('click',()=>result && downloadText('reconciliation_output.csv',E.reconciliationCSV(result)));
  $('journalBtn').addEventListener('click',()=>result && downloadText('journal_output.csv',E.journalCSV(result)));
  $('xeroBtn').addEventListener('click',()=>{
    if(!result) return;
    downloadText('manual journal.csv',E.xeroCSV(result));
  });
  $('xlsxBtn').addEventListener('click',()=>{
    if(!result) return;
    if(typeof XLSX==='undefined'){
      showError('The Excel library could not be loaded. CSV downloads still work. Connect to the internet and reopen the app to enable .xlsx download.');
      return;
    }
    const wb=XLSX.utils.book_new();
    const add=(name,rows,cols)=>{
      const aoa=[cols,...rows.map(r=>cols.map(c=>r[c]??''))];
      const ws=XLSX.utils.aoa_to_sheet(aoa);
      ws['!freeze']={xSplit:0,ySplit:1};
      ws['!cols']=cols.map(c=>({wch:Math.min(34,Math.max(12,String(c).length+2))}));
      XLSX.utils.book_append_sheet(wb,ws,name);
    };
    add('JournalEntriesDaily',result.reconciliationRows,result.reconciliationColumns);
    add('Summary',result.summaryRows,['Country','Total Sales Revenue','Total Shipping','Total Other Tax','Total Refunds']);
    add('Journal',result.journalRows,['Date','Account Code','Description','Debit','Credit']);
    add('Xero Import',result.xeroRows,['*Narration','*Date','Description','*AccountCode','*TaxRate','*Amount','TrackingName1','TrackingOption1','TrackingName2','TrackingOption2']);
    const review=result.audits.filter(a=>a.severity==='ERROR'||a.severity==='REVIEW').map(a=>({Status:a.severity,Category:a.category,Date:a.date||'',Order:a.order||'',Country:a.country||'',Message:a.message||''}));
    add('Review',review,['Status','Category','Date','Order','Country','Message']);
    XLSX.writeFile(wb,`Saint_Sales_${result.metrics.startDate}_to_${result.metrics.endDate}.xlsx`);
  });

  function showError(s){ $('errorMsg').textContent=s; $('errorMsg').classList.add('show'); $('okMsg').classList.remove('show'); }
  function showOk(s){ $('okMsg').textContent=s; $('okMsg').classList.add('show'); $('errorMsg').classList.remove('show'); }
  function hideMessages(){ $('errorMsg').classList.remove('show'); $('okMsg').classList.remove('show'); }
})();
