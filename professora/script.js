import { db, auth } from "../firebase.js";
import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc,
  getDoc, serverTimestamp, query, orderBy, where
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const $ = s => document.querySelector(s);
const questionsRef = collection(db, "questions");
const invitesRef = collection(db, "invites");
const membersRef = collection(db, "adminUsers");
let questions = [], currentUser = null, currentRole = null, editingId = null, acceptingInvite = false;

function showAuthTab(which) {
  const login = which === "login";
  $("#loginForm").hidden = !login;
  $("#registerForm").hidden = login;
  $("#showLogin").classList.toggle("active", login);
  $("#showRegister").classList.toggle("active", !login);
  $("#authMessage").textContent = "";
}
$("#showLogin").onclick = () => showAuthTab("login");
$("#showRegister").onclick = () => showAuthTab("register");

function optionCard(i) {
  const el = document.createElement("div");
  el.className = "option-card";
  el.innerHTML = `<div class="option-top"><strong>Alternativa ${"ABCD"[i]}</strong><label class="correct-label"><input type="radio" name="correct" value="${i}" ${i===0?"checked":""}> Correta</label></div>
    <div class="types"><button type="button" class="type-btn active" data-type="text">Texto</button><button type="button" class="type-btn" data-type="image">Imagem</button></div>
    <div class="option-input"><input type="text" class="answer-text" placeholder="Digite a alternativa" required></div>`;
  const area = el.querySelector(".option-input");
  const buttons = el.querySelectorAll(".type-btn");
  buttons.forEach(btn => btn.onclick = () => {
    buttons.forEach(b => b.classList.toggle("active", b === btn));
    if (btn.dataset.type === "text") {
      area.innerHTML = '<input type="text" class="answer-text" placeholder="Digite a alternativa" required>';
    } else {
      area.innerHTML = '<input type="file" class="answer-image" accept="image/*" required><img class="preview" alt="Prévia" hidden>';
      const input = area.querySelector("input");
      input.onchange = () => {
        const file = input.files[0]; if (!file) return;
        if (!file.type.startsWith("image/")) { alert("Selecione um arquivo de imagem."); input.value=""; return; }
        if (file.size > 100 * 1024) { alert("Para manter o projeto no plano gratuito, cada imagem deve ter no máximo 100 KB."); input.value=""; return; }
        const reader = new FileReader();
        reader.onload = () => { const img=area.querySelector("img"); img.src=reader.result; img.hidden=false; };
        reader.readAsDataURL(file);
      };
    }
  });
  return el;
}
function resetQuestionForm() {
  editingId = null; $("#questionForm").reset();
  $("#formTitle").textContent = "Nova pergunta";
  $("#saveQuestion").textContent = "Salvar pergunta";
  $("#cancelEdit").hidden = true;
  $("#options").innerHTML = "";
  for (let i=0;i<4;i++) $("#options").append(optionCard(i));
}
resetQuestionForm();

async function readImage(file) {
  return new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function collectOptions(oldOptions=[]) {
  const out=[];
  for(let i=0;i<4;i++) {
    const card=$("#options").children[i];
    const type=card.querySelector(".type-btn.active").dataset.type;
    if(type==="text") {
      const value=card.querySelector(".answer-text").value.trim();
      if(!value) throw new Error(`Preencha a alternativa ${"ABCD"[i]}.`);
      out.push({type,value});
    } else {
      const file=card.querySelector(".answer-image").files[0];
      const old=oldOptions[i];
      if(!file && (!old || old.type!=="image" || !old.dataUrl)) throw new Error(`Selecione uma imagem para a alternativa ${"ABCD"[i]}.`);
      out.push({type,dataUrl:file ? await readImage(file) : old.dataUrl});
    }
  }
  return out;
}
function renderQuestions() {
  $("#count").textContent=questions.length;
  $("#questionList").innerHTML="";
  $("#emptyState").hidden=questions.length>0;
  questions.forEach((q,i)=>{
    const item=document.createElement("article"); item.className="question-item";
    const info=document.createElement("div"), title=document.createElement("strong"), meta=document.createElement("p");
    title.textContent=`${i+1}. ${q.statement}`;
    meta.textContent=`4 alternativas • correta: ${"ABCD"[q.correct]}`;
    info.append(title,meta);
    const actions=document.createElement("div"); actions.className="item-actions";
    const edit=document.createElement("button"); edit.className="small-btn"; edit.textContent="Editar"; edit.onclick=()=>editQuestion(q.id);
    const del=document.createElement("button"); del.className="small-btn delete"; del.textContent="Excluir";
    del.onclick=async()=>{if(confirm("Deseja excluir esta pergunta?")){try{await deleteDoc(doc(db,"questions",q.id));await loadQuestions()}catch(e){alert("Erro ao excluir: "+e.message)}}};
    actions.append(edit,del); item.append(info,actions); $("#questionList").append(item);
  });
}
async function loadQuestions() {
  const snap=await getDocs(query(questionsRef,orderBy("createdAt","desc")));
  questions=snap.docs.map(d=>({id:d.id,...d.data()}));
  renderQuestions();
}
$("#questionForm").onsubmit=async e=>{
  e.preventDefault();
  const btn=$("#saveQuestion"); btn.disabled=true; btn.textContent="Salvando...";
  try {
    const previous=questions.find(q=>q.id===editingId);
    const payload={
      statement:$("#statement").value.trim(),
      options:await collectOptions(previous?.options||[]),
      correct:Number($('input[name="correct"]:checked').value),
      updatedAt:serverTimestamp()
    };
    if(!payload.statement) throw new Error("Digite o enunciado da pergunta.");
    if(editingId) await updateDoc(doc(db,"questions",editingId),payload);
    else await addDoc(questionsRef,{...payload,createdAt:serverTimestamp(),createdBy:currentUser.uid});
    await loadQuestions(); resetQuestionForm();
  } catch(err) { console.error(err); alert("Não foi possível salvar. Verifique as regras do Firestore. "+err.message); }
  finally { btn.disabled=false; btn.textContent=editingId?"Salvar alterações":"Salvar pergunta"; }
};
function editQuestion(id) {
  const q=questions.find(x=>x.id===id); if(!q)return;
  editingId=id; $("#statement").value=q.statement; $("#options").innerHTML="";
  q.options.forEach((o,i)=>{
    const c=optionCard(i); $("#options").append(c);
    if(o.type==="image") {
      c.querySelector('[data-type="image"]').click();
      const input=c.querySelector(".answer-image"); input.required=false;
      const img=c.querySelector("img"); img.src=o.dataUrl; img.hidden=false;
    } else c.querySelector(".answer-text").value=o.value;
    c.querySelector(`input[name="correct"][value="${i}"]`).checked=q.correct===i;
  });
  $("#formTitle").textContent="Editar pergunta";
  $("#saveQuestion").textContent="Salvar alterações";
  $("#cancelEdit").hidden=false;
  window.scrollTo({top:0,behavior:"smooth"});
}
$("#cancelEdit").onclick=resetQuestionForm;

async function loadTeam() {
  if(currentRole!=="owner") return;
  const [invSnap,memberSnap]=await Promise.all([getDocs(invitesRef),getDocs(membersRef)]);
  $("#inviteList").innerHTML="";
  if(invSnap.empty) $("#inviteList").innerHTML='<p class="muted">Nenhum convite pendente.</p>';
  invSnap.forEach(d=>{
    const row=document.createElement("div"); row.className="member-row";
    const email=document.createElement("span"); email.textContent=d.data().email+" · convite pendente";
    const cancel=document.createElement("button"); cancel.className="small-btn delete"; cancel.textContent="Cancelar convite";
    cancel.onclick=async()=>{if(confirm("Cancelar este convite?")){await deleteDoc(doc(db,"invites",d.id));await loadTeam()}};
    row.append(email,cancel); $("#inviteList").append(row);
  });
  $("#memberList").innerHTML="";
  memberSnap.forEach(d=>{
    const m=d.data(); const row=document.createElement("div"); row.className="member-row";
    const label=document.createElement("span"); label.textContent=(m.email||d.id)+" · "+(m.role==="owner"?"Administradora principal":"Administrador");
    row.append(label);
    if(m.role!=="owner") {
      const revoke=document.createElement("button"); revoke.className="small-btn delete"; revoke.textContent="Revogar acesso";
      revoke.onclick=async()=>{if(confirm("Revogar o acesso deste administrador?")){await deleteDoc(doc(db,"adminUsers",d.id));await loadTeam()}};
      row.append(revoke);
    }
    $("#memberList").append(row);
  });
}
$("#inviteForm").onsubmit=async e=>{
  e.preventDefault();
  const email=$("#inviteEmail").value.trim().toLowerCase();
  if(!email) return;
  try {
    await setDoc(doc(db,"invites",email),{email,invitedBy:currentUser.uid,createdAt:serverTimestamp()});
    $("#inviteResult").hidden=false;
    $("#inviteResult").textContent=`Convite criado para ${email}. Compartilhe o endereço do EcoQuiz ADM com essa pessoa. Ela deve abrir “Aceitar convite” e criar a conta usando exatamente esse e-mail.`;
    $("#inviteEmail").value="";
    await loadTeam();
  } catch(err) { alert("Não foi possível criar o convite. Confirme que sua conta está cadastrada como administradora principal. "+err.message); }
};

$("#loginForm").onsubmit=async e=>{
  e.preventDefault(); $("#authMessage").textContent="";
  try { await signInWithEmailAndPassword(auth,$("#loginEmail").value.trim(),$("#loginPassword").value); }
  catch(err){ $("#authMessage").textContent="Não foi possível entrar. Confira e-mail e senha."; }
};
$("#registerForm").onsubmit=async e=>{
  e.preventDefault(); $("#authMessage").textContent="";
  const email=$("#registerEmail").value.trim().toLowerCase();
  try {
    const invitation=await getDoc(doc(db,"invites",email));
    if(!invitation.exists()) throw new Error("Não encontramos um convite pendente para esse e-mail.");
    acceptingInvite = true;
    const credential=await createUserWithEmailAndPassword(auth,email,$("#registerPassword").value);
    await setDoc(doc(db,"adminUsers",credential.user.uid),{email,role:"admin",createdAt:serverTimestamp()});
    acceptingInvite = false;
    $("#authMessage").textContent="Convite aceito! Sua conta de administrador foi criada.";
    await activateUser(credential.user);
  } catch(err) {
    $("#authMessage").textContent=err.message.includes("invitation")||err.message.includes("convite")?err.message:"Não foi possível criar a conta. Verifique se o e-mail recebeu um convite e se a senha tem pelo menos 6 caracteres.";
  }
};

function makePin() { return String(Math.floor(100000 + Math.random() * 900000)); }
$("#createRoom").onclick = async () => {
  const button=$("#createRoom"), msg=$("#roomMessage");
  button.disabled=true; button.textContent="Criando sala...";
  msg.textContent="";
  try {
    if (!questions.length) throw new Error("Cadastre pelo menos uma pergunta antes de criar uma sala.");
    const requested=$("#roomQuestionCount").value;
    const count=requested==="all" ? questions.length : Math.min(Number(requested),questions.length);
    const selected=[...questions].sort(()=>Math.random()-0.5).slice(0,count);
    let pin, collision=true;
    for(let attempt=0;attempt<10 && collision;attempt++) {
      pin=makePin();
      const existing=await getDocs(query(collection(db,"gameRooms"),where("pin","==",pin),where("status","==","waiting")));
      collision=!existing.empty;
    }
    if(collision) throw new Error("Não foi possível gerar um PIN exclusivo. Tente novamente.");
    const room=await addDoc(collection(db,"gameRooms"),{
      pin, status:"waiting", hostUid:currentUser.uid,
      questionSet:selected.map(q=>({statement:q.statement,options:q.options})),
      questionCount:selected.length, currentQuestionIndex:-1, questionDuration:25, createdAt:serverTimestamp()
    });
    await setDoc(doc(db,"gameRooms",room.id,"answerKeys","key"),{
      correctAnswers:selected.map(q=>q.correct), createdAt:serverTimestamp()
    });
    window.location.href=`sala-professora.html?room=${room.id}`;
  } catch(e) { msg.textContent=e.message; }
  finally { button.disabled=false; button.textContent="Criar sala e gerar PIN"; }
};

$("#logout").onclick=()=>signOut(auth);

async function activateUser(user) {
  currentUser=user; currentRole=null;
  $("#authPanel").hidden=!!user; $("#adminContent").hidden=!user;
  if(!user) { questions=[]; renderQuestions(); return; }
  try {
    const roleSnap=await getDoc(doc(db,"adminUsers",user.uid));
    if(!roleSnap.exists()) {
      $("#adminContent").hidden=true; $("#authPanel").hidden=false;
      $("#authMessage").textContent="Esta conta ainda não tem permissão de administrador. Peça à administradora principal que envie um convite.";
      await signOut(auth); return;
    }
    currentRole=roleSnap.data().role;
    $("#teamPanel").hidden=currentRole!=="owner";
    await loadQuestions();
    if(currentRole==="owner") await loadTeam();
  } catch(err) {
    $("#authMessage").textContent="Erro ao verificar suas permissões. Confira as regras do Firestore.";
    await signOut(auth);
  }
}
onAuthStateChanged(auth, async user => {
  if (acceptingInvite) return;
  if (!user) {
    currentUser = null; currentRole = null;
    $("#authPanel").hidden = false; $("#adminContent").hidden = true;
    questions = []; renderQuestions(); return;
  }
  await activateUser(user);
});
