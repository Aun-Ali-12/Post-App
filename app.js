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
  logBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "./form.html";
  });
}

//onclick signup btn in loginform
let suBtn = document.getElementById("signup");
if (suBtn) {
  suBtn.addEventListener("click", (e) => {
    e.preventDefault();
    suForm.style.display = "block";
    liForm.style.display = "none";
  });
}

//onclick signin btn in Signupform
let siBtn = document.getElementById("signin");
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
  //on click signup button
  cAcc.addEventListener("click", (e) => {
    e.preventDefault();
    createAcc();
  });
}

//Function to create an account:
async function createAcc() {
  const { data, error } = await client.auth.signUp({
    email: cEmail.value,
    password: cPass.value,
    options: {
      data: {
        name: cName.value,
      },
    },
  });
  error ? alert(error.message) : alert("Account created successfully"),
    (suForm.style.display = "none");
  liForm.style.display = "block";
}

/******************* Login Functionality: ********************/
let liMail = document.getElementById("l-email");
let liPass = document.getElementById("l-pass");
if (document.getElementById("loginAcc")) {
  document.getElementById("loginAcc").addEventListener("click", (e) => {
    e.preventDefault();
    loginAcc();
  });
}
//Function to perform login functionality:
let userName = document.getElementById("show");
async function loginAcc() {
  const { data, error } = await client.auth.signInWithPassword({
    email: liMail.value,
    password: liPass.value,
  });
  error ? alert(error.message) : alert("Login successfull"),
    (window.location.href = "profile.html");
}

/***************** Sign out functionality ********************/
if (document.getElementById("logout")) {
  document.getElementById("logout").addEventListener("click", async () => {
    const { data, error } = await client.auth.getSession();
    !error ? (window.location.href = "form.html") : alert(error.message);
  });
}

//Auth check:
async function authCheck() {
  const {
    data: { session },
    error,
  } = await client.auth.getSession();
  !session
    ? alert("First Login")((window.location.href = "form.html"))
    : console.log(session);
  //user name on profile:
  userName.innerHTML = `<p>${session.user.user_metadata.name}</p><p>${session.user.user_metadata.email}</p>`;
}
//checking auth func on specific pathname
if (window.location.pathname == "/profile.html") {
  authCheck();
}

/************* User content posting  ********/
