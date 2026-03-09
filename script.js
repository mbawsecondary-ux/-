const securityKeyInput = document.getElementById('securityKey');
const verifyKeyBtn = document.getElementById('verifyKeyBtn');
const questionForm = document.getElementById('questionForm');

const questionTypeSelect = document.getElementById('questionType');
const optionsSection = document.getElementById('optionsSection');
const optionsContainer = document.getElementById('optionsContainer');
const addOptionBtn = document.getElementById('addOptionBtn');
const sendQuestionBtn = document.getElementById('sendQuestionBtn');
const questionDisplay = document.getElementById('questionDisplay');
const displayedQuestion = document.getElementById('displayedQuestion');
const answerSection = document.getElementById('answerSection');
const responsesSection = document.getElementById('responsesSection');
const responsesStats = document.getElementById('responsesStats');
const responsesChartCanvas = document.getElementById('responsesChart');
const questionTextInput = document.getElementById('questionText');

const SECURE_KEY = "0100"; // مفتاح الأمان مرة واحدة عند فتح الواجهة

let currentQuestion = null;
let responses = [];
let voted = false;
let chart = null;

// تحقق مفتاح الأمان مرة واحدة
verifyKeyBtn.addEventListener('click', () => {
  if(securityKeyInput.value === SECURE_KEY){
    questionForm.style.display='block';
    securityKeyInput.disabled=true; verifyKeyBtn.disabled=true;
  } else { alert('مفتاح الأمان خاطئ!'); }
});

// ظهور قسم الخيارات حسب نوع السؤال
questionTypeSelect.addEventListener('change',()=>{
  clearOptions();
  if(questionTypeSelect.value==='multiple'||questionTypeSelect.value==='vote'){
    optionsSection.style.display='block'; addOptionInput('خيار 1'); addOptionInput('خيار 2');
  } else { optionsSection.style.display='none'; }
});

addOptionBtn.addEventListener('click',()=>addOptionInput(''));

function addOptionInput(value){
  const div=document.createElement('div'); div.classList.add('option-input');
  const input=document.createElement('input'); input.type='text'; input.value=value; input.placeholder='اكتب نص الخيار';
  const btn=document.createElement('button'); btn.type='button'; btn.textContent='حذف'; btn.addEventListener('click',()=>div.remove());
  div.appendChild(input); div.appendChild(btn); optionsContainer.appendChild(div);
}

function clearOptions(){ optionsContainer.innerHTML=''; }

sendQuestionBtn.addEventListener('click',()=>{
  const qText=questionTextInput.value.trim(); if(!qText){ alert('اكتب السؤال'); return; }
  let qType=questionTypeSelect.value; let opts=[];
  if(qType==='multiple'||qType==='vote'){
    const inputs=optionsContainer.querySelectorAll('input[type=text]');
    opts=Array.from(inputs).map(i=>i.value.trim()).filter(v=>v);
    if(opts.length<2){ alert('يجب خيارين على الأقل'); return; }
  } else if(qType==='yesno'){ opts=['نعم','لا']; }

  currentQuestion={text:qText,type:qType,options:opts};
  responses=[]; voted=false; displayQuestion(); clearInputs(); clearChart();
});

function displayQuestion(){
  questionDisplay.style.display='block'; responsesSection.style.display='none';
  displayedQuestion.textContent=currentQuestion.text; answerSection.innerHTML='';

  if(currentQuestion.type==='text'){
    const textarea=document.createElement('textarea'); textarea.rows=3; textarea.placeholder='اكتب جوابك هنا';
    answerSection.appendChild(textarea);
    const submitBtn=document.createElement('button'); submitBtn.textContent='إرسال'; submitBtn.className='vote-btn';
    submitBtn.addEventListener('click',()=>{ if(voted){ alert('لقد أجبت'); return; } const ans=textarea.value.trim();
      if(!ans){ alert('اكتب جواب'); return; } responses.push(ans); voted=true; alert('تم تسجيل إجابتك'); showStats();
    }); answerSection.appendChild(submitBtn);
  } else { // multiple, yesno, vote
    currentQuestion.options.forEach(opt=>{
      const btn=document.createElement('button'); btn.textContent=opt; btn.className='vote-btn';
      btn.addEventListener('click',()=>{ if(voted){ alert('لقد أجبت'); return; } responses.push(opt); voted=true; alert('تم تسجيل إجابتك'); showStats(); });
      answerSection.appendChild(btn);
    });
  }
}

function clearInputs(){ questionTextInput.value=''; clearOptions(); optionsSection.style.display='none'; }

function showStats(){
  responsesSection.style.display='block'; responsesStats.innerHTML='';
  if(currentQuestion.type==='text'){ const ul=document.createElement('ul'); responses.forEach(resp=>{ const li=document.createElement('li'); li.textContent=resp; ul.appendChild(li); }); responsesStats.appendChild(ul); clearChart();
  } else {
    let counts={}; currentQuestion.options.forEach(opt=>counts[opt]=0); responses.forEach(r=>{ if(counts[r]!==undefined) counts[r]++; });
    for(const [opt,count] of Object.entries(counts)){ const div=document.createElement('div'); div.textContent=`${opt}: ${count}`; responsesStats.appendChild(div);}
    const colors=['#007bff','#28a745','#ffc107','#dc3545','#6f42c1','#20c997','#fd7e14'];
    const labels=Object.keys(counts); const data=Object.values(counts);
    if(chart){ chart.destroy(); }
    chart=new Chart(responsesChartCanvas,{type:'bar',data:{labels:labels,datasets:[{label:'عدد الأصوات',data:data,backgroundColor:colors.slice(0,labels.length)}]},options:{responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return `${ctx.label}: ${ctx.parsed}`;}}}}}});
  }
}

function clearChart(){ if(chart){ chart.destroy(); chart=null; } }

questionTypeSelect.dispatchEvent(new Event('change'));