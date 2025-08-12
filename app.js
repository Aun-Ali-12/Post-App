import { client } from "./config.js";
console.log(client);

let logBtn = document.getElementById("sign-in-nav");
let suForm = document.getElementById("signup-form");
let liForm = document.getElementById("login-form");

if (suForm) {
  suForm.style.display = "none";
}

// onclick login btn on index html
if (logBtn) {
  logBtnBtn.addEventListener("click", () => {
    window.location.href = "./form.html";
    liForm.style.display = "block";
  });
}

let suBtn = document.getElementById("signup");
//onclick signup btn in loginform
if (suBtn) {
  suBtn.addEventListener("click", (e) => {
    e.preventDefault();
    suForm.style.display = "block";
    liForm.style.display = "none";
  });
}

let siBtn = document.getElementById("signin");
//onclick signup btn in loginform
if (siBtn) {
  siBtn.addEventListener("click", (e) => {
    e.preventDefault();
    suForm.style.display = "none";
    liForm.style.display = "block";
  });
}

/************************** Auth Functionality: *********************/

//creation of an acc:
let cAcc = document.getElementById("createAcc");
let cEmail = document.getElementById("c-email");
let cPass = document.getElementById("c-pass");
let cName = document.getElementById("c-name");

if (cAcc) {
  cAcc.addEventListener("click", (e) => {
    e.preventDefault();
    createAcc();
  });
  cAcc.addEventListener("keydown", (event) => {
    e.preventDefault();
    if (event.key == "Enter") {
      createAcc();
    }
  });
}

async function createAcc() {
  const { data, error } = await client.auth.signUp({
    email: cEmail.value,
    password: cPass.value,
    options: {
      name: cName.value,
    },
  });
  error? console.error(error.message):  console.log(cEmail.value, cPass.value, cName.value);
}
