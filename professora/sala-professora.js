import { db, auth } from "../firebase.js";
import { doc, collection, onSnapshot, updateDoc, getDoc, getDocs, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
const roomId=new URLSearchParams(location.search).get("room"), $=s=>document.querySelector(s);
const waitForAuth=()=>new Promise(resolve=>{const unsub=onAuthStateChanged(auth,u=>{unsub();resolve(u);});});
let roomRef, roomData, answerKeys=[], players=[], answers=[], stopRoom, stopPlayers, stopAnswers, timer;
let autoAdvanceKey = null;
if(!roomId)$("#roomError").textContent="Identificador da sala ausente.";
else{
 const user=await waitForAuth();roomRef=doc(db,"gameRooms",roomId);const snap=await getDoc(roomRef);
 if(!snap.exists())$("#roomError").textContent="Sala não encontrada.";
 else if(!user||snap.data().hostUid!==user.uid)$("#roomError").textContent="Somente a professora que criou a sala pode controlar esta partida.";
 else{
  const roomPin=snap.data().pin;
  $("#pin").textContent=roomPin;
  const joinUrl=new URL("../index.html",location.href);
  joinUrl.searchParams.set("pin",roomPin);
  $("#roomQr").src=`https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${encodeURIComponent(joinUrl.href)}`;
  $("#roomQr").title=`Acesse ${joinUrl.href}`;
  const keySnap=await getDoc(doc(db,"gameRooms",roomId,"answerKeys","key"));
  if(!keySnap.exists()) { $("#roomError").textContent="Gabarito protegido não encontrado. Crie uma nova sala para continuar."; }
  else answerKeys=keySnap.data().correctAnswers||[];
  if(answerKeys.length!==((snap.data().questionSet||[]).length)||answerKeys.some(v=>!Number.isInteger(v)||v<0||v>3)) {
   $("#roomError").textContent="O gabarito desta sala está incompleto ou inválido. Crie uma sala nova.";
  }
  stopPlayers=onSnapshot(collection(db,"gameRooms",roomId,"players"),s=>{players=s.docs.map(d=>({id:d.id,...d.data()}));renderPlayers();});
  stopAnswers=onSnapshot(collection(db,"gameRooms",roomId,"answers"),s=>{answers=s.docs.map(d=>({id:d.id,...d.data()}));renderAnswers();});
  stopRoom=onSnapshot(roomRef,s=>{if(s.exists()){roomData=s.data();renderRoom();}});
  $("#start").onclick=startGame;$("#next").onclick=nextQuestion;
  $("#close").onclick=async()=>{
   if(!confirm("Encerrar esta sala e voltar ao painel da professora?")) return;
   const closeButton=$("#close");
   closeButton.disabled=true;
   closeButton.textContent="Encerrando...";
   try {
    await updateDoc(roomRef,{status:"closed",closedAt:serverTimestamp()});
    location.href="index.html";
   } catch(e) {
    $("#roomError").textContent="Não foi possível encerrar a sala: "+e.message;
    closeButton.disabled=false;
    closeButton.textContent="Encerrar sala";
   }
  };
 }
}
function renderPlayers(){
 $("#playerCount").textContent=players.length;$("#players").innerHTML="";
 const ordered=[...players].sort((a,b)=>(b.score||0)-(a.score||0));
 ordered.forEach((p,i)=>{const li=document.createElement("li");const img=document.createElement("img");img.className="player-avatar";img.src=`../assets/personagens/${p.avatar||"tartaruga"}.png`;img.alt="";const label=document.createElement("span");label.textContent=`${i+1}. ${p.nickname||"Participante"} · ${p.score||0} pontos`;li.append(img,label);$("#players").append(li);});
 if(!players.length){const li=document.createElement("li");li.textContent="Aguardando o primeiro aluno...";$("#players").append(li);}
 if(roomData?.status==="finished") renderFinalRanking();
}
function renderFinalRanking(){
 const panel=$("#rankingPanel"),podium=$("#podium"),others=$("#otherPlayers");
 if(!panel||!podium||!others)return;
 panel.hidden=false;podium.innerHTML="";others.innerHTML="";
 const ordered=[...players].sort((a,b)=>(b.score||0)-(a.score||0));
 if(!ordered.length){others.textContent="Nenhum participante concluiu a partida.";return;}
 const places=[
  {p:ordered[1],name:"2º lugar",medal:"🥈",cls:"second"},
  {p:ordered[0],name:"1º lugar",medal:"🏆",cls:"first"},
  {p:ordered[2],name:"3º lugar",medal:"🥉",cls:"third"}
 ];
 places.forEach(item=>{
  if(!item.p)return;
  const card=document.createElement("div");card.className=`podium-place ${item.cls}`;
  const trophy=document.createElement("div");trophy.className="podium-trophy";trophy.textContent=item.medal;
  const img=document.createElement("img");img.src=`../assets/personagens/${item.p.avatar||"tartaruga"}.png`;img.alt="";
  const name=document.createElement("div");name.className="podium-name";name.textContent=item.p.nickname||"Participante";
  const place=document.createElement("div");place.textContent=item.name;
  const score=document.createElement("div");score.className="podium-score";score.textContent=`${item.p.score||0} pontos`;
  card.append(trophy,img,name,place,score);podium.append(card);
 });
 ordered.slice(3).forEach((p,i)=>{
  const chip=document.createElement("div");chip.className="other-player";
  const img=document.createElement("img");img.src=`../assets/personagens/${p.avatar||"tartaruga"}.png`;img.alt="";
  const label=document.createElement("span");label.textContent=`${i+4}º ${p.nickname||"Participante"} · ${p.score||0}`;
  chip.append(img,label);others.append(chip);
 });
}
function renderAnswers(){
 if(!roomData||roomData.status!=="playing")return;
 const count=answers.filter(a=>a.questionIndex===roomData.currentQuestionIndex).length;
 $("#hostTimer").textContent=`${count} de ${players.length} respostas recebidas`;
}
function renderRoom(){
 const qset=roomData.questionSet||[],idx=roomData.currentQuestionIndex??-1;
 $("#roomState").textContent=roomData.status==="waiting"?"Aguardando alunos entrarem...":roomData.status==="playing"?"Pergunta em andamento":roomData.status==="finished"?"Partida concluída":"Sala encerrada";
 if(roomData.status==="waiting"){ $("#hostProgress").textContent="Participantes";$("#hostQuestion").textContent="Quando todos estiverem prontos, inicie a partida.";}
 if(roomData.status==="countdown"){
  $("#hostProgress").textContent="Preparação";$("#hostQuestion").textContent="A turma está recebendo a contagem regressiva...";
  $("#hostOptions").innerHTML="";$("#start").hidden=true;$("#next").hidden=true;
  clearInterval(timer);
  const began=roomData.countdownStartedAt?.toMillis?.()||Date.now();
  const tickCountdown=async()=>{
   const elapsed=Date.now()-began,left=Math.max(0,5-Math.floor(elapsed/1000));
   $("#hostTimer").textContent=left>0?`A partida começa em ${left}...`:"Iniciando pergunta...";
   if(elapsed>=5000){clearInterval(timer);try{await updateDoc(roomRef,{status:"playing",currentQuestionIndex:0,questionStartedAt:serverTimestamp(),questionDuration:25});}catch(e){$("#roomError").textContent="Não foi possível iniciar a pergunta: "+e.message;}}
  };
  tickCountdown();timer=setInterval(tickCountdown,150);
 }
 if(roomData.status==="playing"&&qset[idx]){
  const q=qset[idx];$("#hostProgress").textContent=`Pergunta ${idx+1} de ${qset.length}`;$("#hostQuestion").textContent=q.statement;
  const correctIndex=answerKeys[idx];
  $("#hostOptions").innerHTML=(q.options||[]).map((o,i)=>`<div style="padding:8px 12px;margin:6px 0;background:${i===correctIndex?"#e8f5e9":"#f5f8f4"};border-radius:8px">${"ABCD"[i]} · ${o.type==="image"?"Imagem":escapeText(o.value||"")}${i===correctIndex?" ✓ correta":""}</div>`).join("");
  $("#next").hidden=false;$("#next").disabled=true;$("#start").hidden=true;
  clearInterval(timer);const started=roomData.questionStartedAt?.toMillis?.()||Date.now();
  const tick=()=>{const elapsed=Date.now()-started;
   if(elapsed<10000){$("#hostTimer").textContent=`Pergunta na tela · alternativas em ${Math.ceil((10000-elapsed)/1000)}s`;}
   else if(elapsed<25000){$("#hostTimer").textContent=`Tempo para responder: ${Math.ceil((25000-elapsed)/1000)}s`;}
   else{
    $("#hostTimer").textContent="Tempo encerrado · contabilizando respostas...";
    $("#next").disabled=true;
    clearInterval(timer);
    const advanceKey=`${roomId}_${idx}`;
    if(autoAdvanceKey!==advanceKey){
     autoAdvanceKey=advanceKey;
     nextQuestion();
    }
   }
  };tick();timer=setInterval(tick,100);
 }
 if(roomData.status==="finished"){
  $("#hostProgress").textContent="Partida concluída";
  $("#hostQuestion").textContent="Todas as perguntas foram respondidas. Confira a classificação final!";
  $("#hostOptions").innerHTML="";$("#next").hidden=true;$("#start").hidden=true;
  renderFinalRanking();
 }
 if(roomData.status==="closed"){ $("#hostQuestion").textContent="Esta sala foi encerrada.";}
 renderAnswers();
}
function escapeText(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function startGame(){
 try{
  if(roomData?.status!=="waiting"||answerKeys.length!==(roomData.questionSet||[]).length||!answerKeys.length) return;
  $("#start").disabled=true;
  await updateDoc(roomRef,{status:"countdown",countdownStartedAt:serverTimestamp(),currentQuestionIndex:-1});
 }
 catch(e){$("#roomError").textContent="Erro ao iniciar: "+e.message;$("#start").disabled=false;}
}
async function nextQuestion(){
 try{
  const idx=roomData.currentQuestionIndex,q=roomData.questionSet[idx];
  const startedAt=roomData.questionStartedAt?.toMillis?.()||0;
  if(roomData.status!=="playing"||!q||Date.now()-startedAt<25000||typeof answerKeys[idx]!=="number") return;
  $("#next").disabled=true;
  const [currentAnswers,currentPlayers]=await Promise.all([
   getDocs(collection(db,"gameRooms",roomId,"answers")),
   getDocs(collection(db,"gameRooms",roomId,"players"))
  ]);
  const answered=new Map(currentAnswers.docs.map(d=>[d.id,d.data()]));
  const batch=writeBatch(db);
  currentPlayers.docs.forEach(playerDoc=>{
   const p={id:playerDoc.id,...playerDoc.data()};
   const a=answered.get(`${p.id}_${idx}`);let points=0;
   if(a&&a.playerId===p.id&&a.uid===p.uid&&a.questionIndex===idx&&Number.isInteger(a.selectedIndex)){
    // O aluno registra o tempo decorrido no instante do clique.
    // Isso evita depender da conversão de Timestamp ou da diferença
    // entre os relógios do navegador do aluno e da professora.
    const totalElapsed=Number(a.responseTimeMs);
    const answerElapsed=Number.isFinite(totalElapsed)
      ? Math.max(0,totalElapsed-10000)
      : Math.max(0,(a.answeredAt?.toMillis?.()||startedAt)-startedAt-10000);
    if(a.selectedIndex===answerKeys[idx]&&answerElapsed<15000){
     // 15s disponíveis: de 15s a 13s = 1000 pontos;
     // de 13s a 0s, queda linear até zero.
     points=answerElapsed<=2000
      ? 1000
      : Math.max(0,Math.round(1000*(1-(answerElapsed-2000)/13000)));
    }
   }
   batch.update(doc(db,"gameRooms",roomId,"players",p.id),{score:(p.score||0)+points});
  });
  if(idx+1>=roomData.questionSet.length)batch.update(roomRef,{status:"finished",finishedAt:serverTimestamp()});
  else batch.update(roomRef,{currentQuestionIndex:idx+1,questionStartedAt:serverTimestamp()});
  await batch.commit();
 }catch(e){$("#roomError").textContent="Erro ao avançar: "+e.message;$("#next").disabled=false;}
}
