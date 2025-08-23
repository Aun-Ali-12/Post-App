import { client } from "./config.js";
console.log(client);

let logBtn = document.getElementById("sign-in-nav");
let suForm = document.getElementById("div-sec");
let liForm = document.getElementById("empty-div");

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
    suForm.classList.add('slides')
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
    liForm.classList.add("slides")
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
        full_name: cName.value,
      },
    },
  });
  error ? alert(error.message) : alert("Account created successfully"),
    (suForm.style.display = "none");
  liForm.style.display = "block";

  //when user signsup, create a row(user_id, full_name) in profile table to combine "post" and "profile" table:
  //get user
  const {
    data: { user },
  } = await client.auth.getUser();
  await client
    .from("profile")
    .insert({ user_id: user.id, full_name: user.user_metadata.full_name });
  console.log(user.user_metadata.full_name);
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
    const { error } = await client.auth.signOut();
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
  userName.innerHTML = `<p>${session.user.user_metadata.full_name}</p><p>${session.user.user_metadata.email}</p>`;
}
//checking auth func on specific pathname
if (window.location.pathname == "/profile.html" || window.location.pathname == '/home.html') {
  authCheck();
}

/************* User content posting  ********/
let image = document.getElementById("image"); //input field for uploading pic for post
let caption = document.getElementById("caption"); //input field for text
let postBtn = document.getElementById("post"); //btn through which post will be posted
let showContent = document.getElementById("content-container"); //div in which only logged in user's post will be shown
let createPostBtn = document.getElementById("createPost"); //Btn to show post container
let postContainer = document.getElementById("post-container"); //container which includes posting inputs
let closeBtn = document.getElementById("close"); //close btn in post container

//initially post container will be hidden
if (postContainer) {
  postContainer.classList.add("hidden");
}

//Onclick create account button, post container will be shown:
if (createPostBtn) {
  createPostBtn.addEventListener("click", () => {
    postContainer.classList.add("show");
  });
}

//onclick close btn in post container
if (postContainer) {
  closeBtn.addEventListener("click", () => {
    postContainer.classList.remove("show");
  });
}

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

let postCount = document.getElementById("post-count");
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
    postCount.innerHTML = `Post ${userpost.length}`;
    showContent.innerHTML += `
    <div>
    <p>${user.user_metadata.full_name}</p>
  <img src = "${value.image_url}" width="100px" height="100px">
    <p>${value.caption}</p>
  </div>
    `;
  });
}
if (showContent) {
  window.addEventListener("DOMContentLoaded", () => {
    userSpecificPost();
  });
}

//navigation to home page:
let homePBtn = document.getElementById("home");
if (homePBtn) {
  homePBtn.addEventListener("click", () => {
    window.location.href = "/home.html";
  });
}

//Show all posts:
let allPost = document.getElementById("show-all-post");
if (allPost) {
  window.addEventListener("DOMContentLoaded", () => {
    fetch();
  });
}

//user specific profile name with post:
async function fetch() {
  const { data: postName, error } = await client.from("Post").select(`user_id,
    caption,
    image_url,
    created_at,
    profile(
      full_name, 
      profile_img
    )`);
  let userId = postName.user_id;
  allPost.innerHTML = "";
  postName
    ? postName.forEach((value) => {
        console.log(value);
        allPost.innerHTML += `
        <img src = "${value.profile.profile_img}" width = "50px" height = "50px"/><p class="username" data-userid = "${value.user_id}">${value.profile.full_name}</p>
       <img src = "${value.image_url}" width="100px" height="100px">
       <p>${value.caption}</p>
  
  `;
      })
    : alert(error.message);
}

//user profile:
let profileInput = document.getElementById("profile-img");
let profilePic = document.getElementById("profile-pic");
let shownPic = document.getElementById("profile");
if (profilePic) {
  profilePic.addEventListener("click", () => {
    uploadProfile();
  });
  window.addEventListener("DOMContentLoaded", () => {
    renderProfile();
  });
}

async function uploadProfile() {
  //get user:
  const {
    data: { user },
  } = await client.auth.getUser();
  let userId = user.id;
  let profileObj = profileInput.files[0];
  let folderName = `profile/${userId}-${Date.now()}`;
  console.log(userId);

  //insert profile into buccket
  const { data: insertprofile, error } = await client.storage
    .from("uploadfile")
    .upload(`${folderName}`, profileObj);
  insertprofile ? alert("Ye!!") : alert(error.message);
  console.log(insertprofile);

  //retreive url of profile picture:
  const { data: pic_url } = client.storage
    .from("uploadfile")
    .getPublicUrl(`${folderName}`);
  pic_url ? console.log(pic_url) : console.error(error.message);

  let profileUrl = pic_url.publicUrl;
  // console.log(profileUrl);

  //saving this profile url into profile table:
  const { error: insertError } = await client
    .from("profile")
    .update({
      user_id: userId,
      profile_img: profileUrl,
    })
    .eq("user_id", userId) //because supa base requires where clause
    .select();
  !insertError
    ? console.log("profile added")
    : console.log(insertError.message);
}

let deafultProfile = "./asset/default-profile.png";
async function renderProfile() {
  const {
    data: { user },
  } = await client.auth.getUser();
  let userId = user.id;

  const { data: profileData, error: profileError } = await client
    .from("profile")
    .select("profile_img, full_name")
    .eq("user_id", userId)
    .single();
  if (profileError) {
    alert(profileError.message);
  } else if (profileData && profileData.profile_img) {
    shownPic.src = profileData.profile_img;
  } else {
    shownPic.src = deafultProfile;
  }
}

//function used to create a user specific page:
let getPost = document.getElementById("show-posts");
let getProfile = document.getElementById("show-profile");
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("username")) {
    let userId = e.target.dataset.userid; //Gets user id on click
    window.location.href = `userProfile.html?userId=${userId}`;
  }
});
//param converts query in an easy object
let param = new URLSearchParams(window.location.search);
let userId = param.get("userId"); //get userId
if (userId) {
  loadUserProfile(userId);
}
async function loadUserProfile(userId) {
  //Fetch user profile:
  const { data: profile, error: profileError } = await client
    .from("profile")
    .select("full_name, profile_img")
    .eq("user_id", userId)
    .single();

  profileError
    ? console.log(profileError.message)
    : console.log(profile, "Profile fetched");

  //Fetch Posts:
  const { data: posts, error: postsError } = await client
    .from("Post")
    .select("caption, image_url, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (postsError) {
    console.log(postsError.message);
    return;
  }
  // console.log(posts);

  //ui render:
  // window.location.href = "userProfile.html";
  getProfile.innerHTML = `
  <div class="profile-header">
    <img src="${profile.profile_img}" width="80px" height="80px"/>
    <h2>${profile.full_name}</h2>
  </div>
  `;

  posts.forEach((value) => {
    getPost.innerHTML += `
    <div class="post">
      <img src="${value.image_url}" width="150px" height="150px"/>
      <p>${value.caption}</p>
    </div>
  `;
  });
}

// //loader
// let loader = document.getElementById("loader");
// loader.style.display = "none"
// if (loader) {
//   loader.classList.add("hidden");
// }

// // //show loader func
// // function showLoader() {
// //   loader.classList.remove("hidden");
// // }

// // //hide loader function:
// // function hideLoader() {
// //   loader.classList.add("hidden");
// // }
