// login.js
import googleSignIn from "../../assets/signin_google_neutral.png";
import emailIcon from "../../assets/email.svg";
import passwordIcon from "../../assets/password.svg";
import { auth } from "../../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithGoogle } from "../../auth.js";

export const login = (function () {
	const content = document.createElement("div");
	content.innerHTML = `
    <div class="formTab login">
      <div class="form-container">
        <form id="login-form" action="post">
          <h1>Sign in to CitySeva</h1>
          <a href="#" id="google-signin"><img src="${googleSignIn}" alt="google-sign-up"></a>
          <p>or use your email account:</p>
          <hr>
          <div class="inputs">
            <label for="email">
              <img src="${emailIcon}" alt="icon" height="28" width="28">
              <input type="email" id="email" placeholder="Email" required>
            </label>
            <label for="password">
              <img src="${passwordIcon}" alt="icon" height="28" width="28">
              <input type="password" id="password" placeholder="Password" required>
            </label>
          </div>
          <button class="btn" type="submit">SIGN IN</button>
        </form>
        <p id="login-error" style="color: red;"></p>
      </div>
      <div class="form-message">
        <h1>Welcome Back!</h1>
        <p>To keep connected with us please login with your personal information</p>
      </div>
    </div>
  `;

	// Add Google Sign-in handler
	const googleSignInButton = content.querySelector("#google-signin");
	googleSignInButton.addEventListener("click", async (e) => {
		e.preventDefault();
		const errorElement = content.querySelector("#login-error");
		try {
			await signInWithGoogle();
			window.location.href = "/#/dashboard";
		} catch (error) {
			errorElement.textContent = error.message;
		}
	});

	const form = content.querySelector("#login-form");
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const email = form.querySelector("#email").value;
		const password = form.querySelector("#password").value;
		const errorElement = content.querySelector("#login-error");

		try {
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password
			);
			window.location.href = "/#/dashboard";
		} catch (error) {
			errorElement.textContent = error.message;
		}
	});

	return {
		content,
	};
})();
