import { db } from "./firebase.js";
import { doc, collection, onSnapshot, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
const data=JSON.parse(sessionStorage.getItem("ecoquizPlayer")||"null");
const $=s=>document.querySelector(s);
let roomData=null, answeredIndex=null, timerHandle=null, stopRoom=null, stopPlayer=null;
if(!data){location.href="index.html";} else {
 $("#welcome").innerHTML="";
 const avatarImg=document.createElement("img");avatarImg.className="player-avatar";avatarImg.src=`./assets/personagens/${data.avatar||"tartaruga"}.png`;avatarImg.alt="";
 const welcomeText=document.createElement("span");welcomeText.textContent=`Olá, ${data.nickname}`;
 $("#welcome").append(avatarImg,welcomeText);
 const roomRef=doc(db,"gameRooms",data.roomId);
 const playerRef=doc(db,"gameRooms",data.roomId,"players",data.playerId);
 stopPlayer=onSnapshot(playerRef,s=>{if(s.exists())$("#scoreLine").textContent=`Sua pontuação: ${s.data().score||0} pontos`;});
 stopRoom=onSnapshot(roomRef,snap=>{
  if(!snap.exists()){ $("#phaseTitle").textContent="Sala indisponível";$("#questionText").textContent="Esta sala não foi encontrada.";return;}
  roomData=snap.data(); render();
 },error=>{
  console.error("Erro ao acompanhar a sala:",error);
  $("#phaseTitle").textContent="Falha na conexão";
  $("#questionText").textContent="Não foi possível carregar a pergunta. Atualize a página ou confira as regras do Firestore.";
  $("#feedback").textContent=error.message;
 });
}
function render(){
 clearInterval(timerHandle);
 const status=roomData.status;
 if(status==="waiting"){ $("#phaseTitle").textContent="Sala de espera";$("#questionText").textContent="Você entrou! Aguarde a professora iniciar o jogo.";$("#answers").innerHTML="";$("#timer").textContent="🌱";$("#questionProgress").textContent=`PIN ${roomData.pin}`;$("#feedback").textContent="";return;}
 if(status==="countdown"){
  $("#answers").innerHTML="";$("#questionProgress").textContent="Prepare-se!";
  const began=roomData.countdownStartedAt?.toMillis?.()||Date.now();
  const tickCountdown=()=>{
   const left=Math.max(0,5-Math.floor((Date.now()-began)/1000));
   $("#phaseTitle").textContent="Prepare-se!";
   $("#questionText").textContent=left>0?`A partida irá começar em ${left}...`:"Vamos começar!";
   $("#timer").textContent=left>0?`${left}s`:"🌱";
  };
  tickCountdown();timerHandle=setInterval(tickCountdown,150);return;
 }
 if(status==="closed"){ $("#phaseTitle").textContent="Partida encerrada";$("#questionText").textContent="A professora encerrou a partida. Obrigado por participar!";$("#answers").innerHTML="";$("#timer").textContent="✓";return;}
 if(status==="finished"){ $("#phaseTitle").textContent="Fim de jogo!";$("#questionText").textContent="Todas as perguntas foram respondidas. Confira o pódio na tela da professora." ;$("#answers").innerHTML="";$("#timer").textContent="🏆";return;}
 const idx=Number.isInteger(roomData.currentQuestionIndex)?roomData.currentQuestionIndex:0;
 const questions=Array.isArray(roomData.questionSet)?roomData.questionSet:[];
 const q=questions[idx];
 if(!q){
  $("#phaseTitle").textContent="Preparando pergunta";
  $("#questionText").textContent="A pergunta ainda não foi carregada. Aguarde alguns instantes.";
  $("#answers").innerHTML="";
  $("#feedback").textContent=`Índice recebido: ${idx} · Perguntas disponíveis: ${questions.length}`;
  return;
 }
 $("#questionProgress").textContent=`Pergunta ${idx+1} de ${questions.length}`;
 $("#questionText").textContent=q.statement;
 $("#feedback").textContent="";
 const started=roomData.questionStartedAt?.toMillis?.()||Date.now();
 const revealMs=10000, answerMs=15000, totalMs=revealMs+answerMs;
 const elapsed=()=>Date.now()-started;
 const area=$("#answers");
 function showAnswers(){
  if(area.dataset.question===String(idx))return;
  area.dataset.question=String(idx);area.innerHTML="";
  (q.options||[]).forEach((opt,i)=>{
   const b=document.createElement("button");b.className="answer";
   if(opt.type==="image"&&opt.dataUrl){const img=document.createElement("img");img.src=opt.dataUrl;img.alt=`Alternativa ${"ABCD"[i]}`;img.style="display:block;max-width:100%;max-height:150px;margin-bottom:8px";b.append(img);}
   else b.append(document.createTextNode(`${"ABCD"[i]}. ${opt.value||""}`));
   b.onclick=()=>submitAnswer(i,b);area.append(b);
  });
 }
 area.innerHTML="";delete area.dataset.question;answeredIndex=null;
 const tick=()=>{
  const ms=elapsed();
  if(ms<revealMs){
   $("#phaseTitle").textContent="Leia a pergunta";
   $("#timer").textContent=`${Math.ceil((revealMs-ms)/1000)}s`;
   $("#feedback").textContent="As alternativas aparecerão em instantes...";
  }else if(ms<totalMs){
   showAnswers();$("#phaseTitle").textContent="Escolha sua resposta";
   const left=Math.max(0,Math.ceil((totalMs-ms)/1000));
   $("#timer").textContent=`${left}s`;
   $("#feedback").textContent=answeredIndex===null?"Responda antes que o tempo acabe!":"Resposta enviada!";
  }else{
   showAnswers();$("#phaseTitle").textContent="Tempo encerrado";
   $("#timer").textContent="0s";disableAnswers();
   if(answeredIndex===null)$("#feedback").textContent="O tempo para responder acabou.";
   clearInterval(timerHandle);
  }
 };
 tick();timerHandle=setInterval(tick,100);
}
function disableAnswers(){document.querySelectorAll(".answer").forEach(b=>b.disabled=true);}
async function submitAnswer(index,button){
 if(answeredIndex!==null)return;
 const elapsed=Date.now()-(roomData.questionStartedAt?.toMillis?.()||Date.now());
 if(elapsed<10000||elapsed>=25000)return;
 answeredIndex=index;disableAnswers();button.classList.add("selected");
 try{
  const questionIndex=roomData.currentQuestionIndex;
  const answerId=`${data.playerId}_${questionIndex}`;
  await setDoc(doc(db,"gameRooms",data.roomId,"answers",answerId),{
   playerId:data.playerId,
   uid:data.uid,
   questionIndex,
   selectedIndex:index,
   responseTimeMs: elapsed,
   answeredAt:serverTimestamp()
  });
  $("#feedback").textContent="Resposta registrada! Aguarde a próxima pergunta.";
 }catch(e){
  console.error("Falha ao salvar resposta no Firestore:",e);
  $("#feedback").textContent="Falha ao registrar resposta ("+(e.code||"erro")+"). Avise a professora.";
  answeredIndex=null;document.querySelectorAll(".answer").forEach(b=>b.disabled=false);
 }
}
$("#leave").onclick=()=>{if(stopRoom)stopRoom();if(stopPlayer)stopPlayer();sessionStorage.removeItem("ecoquizPlayer");location.href="index.html";};
