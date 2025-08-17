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
    window.location.href = "./index.html";
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
let userName = document.getElementById("show-user-detail");
async function loginAcc() {
  const { data, error } = await client.auth.signInWithPassword({
    email: liMail.value,
    password: liPass.value,
  });
  !error
    ? alert("Login successfull")((window.location.href = "profile.html"))
    : alert(error.message);
}

/***************** Sign out functionality ********************/
if (document.getElementById("logout")) {
  document.getElementById("logout").addEventListener("click", async () => {
    const { error } = await client.auth.signOut()
    !error ? (window.location.href = "index.html") : alert(error.message);
  });
}

//Auth check:
async function authCheck() {
  const {
    data: { session },
    error,
  } = await client.auth.getSession();
  !session
    ? alert("First Login")((window.location.href = "index.html"))
    : console.log(session);
  //user name on profile:
  userName.innerHTML = `<p>${session.user.user_metadata.name}</p><p>${session.user.user_metadata.email}</p>`;
}
//checking auth func on specific pathname
if (window.location.pathname == "/profile.html") {
  authCheck();
}

/************* User content posting  ********/
let image = document.getElementById("image");
let caption = document.getElementById("caption");
let postBtn = document.getElementById("post");
let showContent = document.getElementById("content-container");
if (postBtn) {
  postBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    //get user session
    const {
      data: { session },
    } = await client.auth.getSession();
    console.log(session);
    // console.log(session.user.id);
    //inserting file/img into buccket
    let fileObj = image.files[0];
    let fileName = `public/${session.user.id}-${Date.now()}`;
    const { data, error } = await client.storage
      .from("uploadfile")
      .upload(`${fileName}`, fileObj);
    if (error) {
      alert(error);
      console.log(error.message);
    } else {
      console.log(data);
      alert("Uploaded");
    }

    //get img from buccket:
    const { data: getUrl } = await client.storage
      .from("uploadfile")
      .getPublicUrl(`${fileName}`);

    //img url which will be inserted in table
    let imgUrl = getUrl.publicUrl;
    console.log(imgUrl);
    console.log(getUrl, "get url");

    //get user:
    const {
      data: { user },
    } = await client.auth.getUser();
    // console.log(user);
    // console.log(user.id);
    let userId = user.id;

    //insert info into table
    const { data: insertData, error: insertError } = await client
      .from("Post")
      .insert({ user_id: userId, caption: caption.value, image_url: imgUrl });
    if (insertError) {
      console.log(insertError.message);
    } else {
      userSpecificPost();
    }
  });
}

//Func executes on user profile(retreives only loggedin user posts )
async function userSpecificPost() {
  //get user:
  const {
    data: { user },
  } = await client.auth.getUser();
  let userId = user.id;
  console.log(userId);
  showContent.innerHTML = "";
  const { data: userpost, error: usererror } = await client
    .from("Post")
    .select("*")
    .eq("user_id", userId);
  userpost.forEach((value) => {
    showContent.innerHTML += `
  <p>${value.caption}</p>
  <img src = "${value.image_url}" width="100px" height="100px">
  `;
  });
}
if (showContent) {
  window.addEventListener("DOMContentLoaded", () => {
    userSpecificPost();
  });
}

//Show all posts:
let allPost = document.getElementById("show-all-post");
async function fetch() { 
  const { data: allpost, error } = await client.from("Post").select("*");
  if (error) {
    alert("Something is wrong");
    return;
  }
  allpost.innerHTML = "";
  allpost.forEach((value) => {
    allPost.innerHTML += `
    <p>${value.caption}</p>
  <img src = "${value.image_url}" width="100px" height="100px">
  `;
  });
}
if (allPost) {
  window.addEventListener("DOMContentLoaded", () => {
    fetch();
  });
}

//navigation to home page:
let homePBtn = document.getElementById("home");
homePBtn.addEventListener("click", () => {
  window.location.href = "/home.html";
});


//user specific profile name with post:
async function postName(){
  const { data: postName, error } = await client
  .from('Post')
  .select(`user_id,
    caption,
    image_url,
    created_at,
    profile(
      full_name
    )`
  )
    postName? console.log(postName): alert(error.message)
}
postName()