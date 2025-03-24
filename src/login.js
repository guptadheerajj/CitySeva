import googleSignIn from "./assets/signin_google_neutral.png";
import emailIcon from "./assets/email.svg";
import passwordIcon from "./assets/password.svg";

export const login = (function () {
	const content = document.createElement("div");
	content.innerHTML = `
		<div class="formTab login">
			<div class="form-container">
				<form action="post">
					<h1>Sign in to CitySeva</h1>
					<a href="#"><img src="${googleSignIn}" alt="google-sign-up"></a>
					<p>or use your email account:</p>
					<hr>
					<div class="inputs">
						<label for="user-name">
							<img src="${emailIcon}" alt="icon" height="28" width="28">
							<input type="email" placeholder="Email" required>
						</label>
						<label for="user-name">
							<img src="${passwordIcon}" alt="icon" height="28" width="28">
							<input type="password" placeholder="Password" required>
						</label>
					</div>
					<button class="btn">SIGN IN</button>
				</form>
			</div>
			<div class="form-message">
				<h1>Welcome Back!</h1>
				<p>To keep connected with us please login with your personal information</p>
			</div>
		</div>
	`;

	return {
		content,
	};
})();
