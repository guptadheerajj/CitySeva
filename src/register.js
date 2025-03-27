// register.js
import googleSignUp from "./assets/sign_up_google_neutral.png";
import userIcon from "./assets/user.svg";
import emailIcon from "./assets/email.svg";
import passwordIcon from "./assets/password.svg";
import { auth } from "./firebase.js"; // Import the auth object
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export const register = (function () {
	const content = document.createElement("div");
	content.innerHTML = `
    <div class="formTab">
      <div class="form-message">
        <h1>Hello, Friend!</h1>
        <p>Enter your personal details and start journey with us</p>
      </div>
      <div class="form-container">
        <form id="register-form" action="post">
          <h1>Create Account</h1>
          <a href="#"><img src="${googleSignUp}" alt="google-sign-up"></a>
          <p>or use your email for registration:</p>
          <hr>
          <div class="inputs">
            <label for="name">
              <img src="${userIcon}" alt="icon" height="28" width="28">
              <input type="text" id="name" placeholder="Name" required autofocus>
            </label>
            <label for="email">
              <img src="${emailIcon}" alt="icon" height="28" width="28">
              <input type="email" id="email" placeholder="Email" required>
            </label>
            <label for="password">
              <img src="${passwordIcon}" alt="icon" height="28" width="28">
              <input type="password" id="password" placeholder="Password" required>
            </label>
          </div>
          <button class="btn" type="submit">SIGN UP</button>
        </form>
        <p id="register-error" style="color: red;"></p>
      </div>
    </div>
  `;

	// Add event listener for form submission
	const form = content.querySelector("#register-form");
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const name = form.querySelector("#name").value;
		const email = form.querySelector("#email").value;
		const password = form.querySelector("#password").value;
		const errorElement = content.querySelector("#register-error");

		try {
			// Register the user with Firebase Authentication
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredential.user;

			// Update the user's display name
			await updateProfile(user, { displayName: name });

			console.log("User registered:", user);

			// Redirect to the Home page
			const homeTab = document.querySelector('[data-name="homeTab"]');
			homeTab.click(); // Simulate a click to navigate to the Home tab
		} catch (error) {
			errorElement.textContent = error.message;
			console.error("Registration error:", error.code, error.message);
		}
	});

	return {
		content,
	};
})();
