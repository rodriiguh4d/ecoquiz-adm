import { db, auth } from "./firebase.js";
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const form = document.querySelector("#form-entrada");
const aviso = document.querySelector("#aviso");
const pinFromQr = new URLSearchParams(location.search).get("pin");
if (pinFromQr && /^\d{6}$/.test(pinFromQr)) {
  document.querySelector("#pin").value = pinFromQr;
  document.querySelector("#apelido").focus();
}
let selectedAvatar = "tartaruga";
document.querySelectorAll(".avatar-option").forEach(option => {
  option.addEventListener("click", () => {
    selectedAvatar = option.dataset.avatar;
    document.querySelectorAll(".avatar-option").forEach(item => {
      const selected = item === option;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
  });
});
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const pin = document.querySelector("#pin").value.trim();
  const apelido = document.querySelector("#apelido").value.trim();
  if (!/^\d{6}$/.test(pin)) { aviso.textContent = "O PIN deve conter 6 números."; return; }
  if (!apelido) { aviso.textContent = "Digite seu apelido."; return; }
  const button=form.querySelector("button"); button.disabled=true; button.textContent="Entrando...";
  aviso.textContent="";
  try {
    const credential = auth.currentUser ? {user:auth.currentUser} : await signInAnonymously(auth);
    const found = await getDocs(query(collection(db,"gameRooms"),where("pin","==",pin),where("status","==","waiting")));
    if (found.empty) throw new Error("Não encontramos uma sala aberta com esse PIN.");
    const room = found.docs[0];
    const playerRef = await addDoc(collection(db,"gameRooms",room.id,"players"),{
      uid:credential.user.uid, nickname:apelido, avatar:selectedAvatar, joinedAt:serverTimestamp(), score:0
    });
    sessionStorage.setItem("ecoquizPlayer",JSON.stringify({roomId:room.id,playerId:playerRef.id,uid:credential.user.uid,nickname:apelido,avatar:selectedAvatar}));
    window.location.href = "sala.html";
  } catch (error) {
    aviso.textContent = error.message || "Não foi possível entrar na sala.";
  } finally { button.disabled=false; button.textContent="Entrar na partida →"; }
});
document.querySelector("#professor").addEventListener("click", () => { window.location.href = "professora/index.html"; });
