import googleSignUp from "./assets/sign_up_google_neutral.png";
import userIcon from "./assets/user.svg";
import emailIcon from "./assets/email.svg";
import passwordIcon from "./assets/password.svg";

export const register = (function () {
	const content = document.createElement("div");
	content.innerHTML = `
		<div class="formTab">
			<div class="form-message">
				<h1>Welcome Back!</h1>
				<p>To keep connected with us please register with your personal information</p>
			</div>
			<div class="form-container">
				<form action="post">
					<h1>Create Account</h1>
					<a href="#"><img src="${googleSignUp}" alt="google-sign-up"></a>
					<p>or use your email for registration:</p>
					<div class="inputs">
						<label for="user-name">
							<img src="${userIcon}" alt="icon" height="28" width="28">
							<input type="text" placeholder="Name" required autofocus>
						</label>
						<label for="user-name">
							<img src="${emailIcon}" alt="icon" height="28" width="28">
							<input type="email" placeholder="Email" required>
						</label>
						<label for="user-name">
							<img src="${passwordIcon}" alt="icon" height="28" width="28">
							<input type="password" placeholder="Password" required>
						</label>
					</div>
					<button class="btn">SIGN UP</button>
				</form>
			</div>
		</div>
	`;

	return {
		content,
	};
})();
