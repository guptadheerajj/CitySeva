import camera from "./assets/camera.svg";
import automation from "./assets/automation.svg";
import alert from "./assets/alert.svg";

const home = (function () {
	const content = document.createElement("div");
	content.innerHTML = `
	<div class="home">
		<div class="home-heading">
			<h2>Manage and Improve Your City with AI-Powered Civic Issue Reporting</h2>
			<p>Who is City Seva suitable for?</p>
		</div>
		<div class="home-card-container">
			<div class="home-card">
				<img src="${camera}" alt="camera-icon" width="56">
				<h2>Residents & Citizens</h2>
				<p>Upload images of civic problems such as potholes, garbage, or waterlogging.
					Our AI system detects and classifies the issue for automated reporting.</p>
			</div>
			<div class="home-card">
				<img src="${automation}" alt="automation-icon" width="56">
				<h2>Municipal Authorities</h2>
				<p>Receive structured complaints with precise issue classification.
					Optimize urban maintenance with faster response times and improved efficiency.</p>
			</div>
			<div class="home-card">
				<img src="${alert}" alt="alert-icon" width="56">
				<h2>Community Groups & NGOs</h2>
				<p> Enhance public participation in governance.
					Leverage AI-driven automation to streamline civic issue resolution.</p>
			</div>
		</div>
	</div>`;

	return {
		content,
	};
})();
export { home };
