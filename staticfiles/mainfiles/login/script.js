const email = localStorage.getItem("email");
if (email) {
  window.location.href = "/";
}
const urlParams = new URLSearchParams(window.location.search);
const redirect_url = urlParams.get("redirect_url");
const loginButton = document.getElementById("login-btn");
const googleLogin = document.getElementById("google-login-btn");

googleLogin.addEventListener("click", async () => {
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const credentials = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("email", user.email);
      const docRef = doc(db, "user_profile", user.email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        localStorage.setItem("profile", true);
      }
      if (redirect_url) {
        window.location.href = "/myaccount" + redirect_url;
      } else {
        window.location.href = "/myaccount/cv_upload/";
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const credentials = GoogleAuthProvider.credentialFromError(error);
      console.log("Error:", errorMessage);
      console.log("Error:", error.message);
      Toastify({
        text: errorMessage
          .split(" ")[2]
          .split("(")[1]
          .split(")")[0]
          .split("/")[1]
          .replaceAll("-", " "),
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #0d6efd, #586ba6)",
          borderRadius: "10px",
        },
      }).showToast();
    });
});

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    loginButton.innerHTML = "Logging in...";
    loginButton.disabled = true;
    await loginUser(email, password);
  } catch (error) {
    Toastify({
      text: "Try again",
      duration: 3000,
      newWindow: true,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #0d6efd, #586ba6)",
        borderRadius: "10px",
      },
    }).showToast();
  }
  loginButton.innerHTML = "Login";
  loginButton.disabled = false;
});
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (user.emailVerified) {
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("email", user.email);
      const docRef = await doc(db, "user_profile", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        localStorage.setItem("profile", true);
        const redirectTo = redirect_url
          ? redirect_url
          : docSnap.data().about?.cv
          ? "/myaccount/yourprofile"
          : "/myaccount/cv_upload/";
        window.location.href = redirectTo;
      } else {
        const userData = { email, firstName: user.displayName };
        await setDoc(docRef, userData);
        localStorage.setItem("profile", true);
        const redirectTo = redirect_url
          ? redirect_url
          : "/myaccount/cv_upload/";
        window.location.href = redirectTo;
      }
    } else {
      alert("Email is not verified");
      throw new Error("Email is not verified");
    }
  } catch (error) {
    console.log("Error:", error.message);
    Toastify({
      text: error.message
        .split(" ")[2]
        .split("(")[1]
        .split(")")[0]
        .split("/")[1]
        .replaceAll("-", " "),
      duration: 3000,
      newWindow: true,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #0d6efd, #586ba6)",
        borderRadius: "10px",
      },
    }).showToast();
  }
}
