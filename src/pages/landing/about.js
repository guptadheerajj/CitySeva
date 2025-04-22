export const aboutTab = (function () {
	const content = document.createElement("div");
	content.innerHTML = `
		<div class="about-container">
			<div class="about-hero">
				<h1>About CitySeva</h1>
				<p>Empowering citizens to improve their communities through technology</p>
			</div>

			<div class="about-section mission-section">
				<h2>Our Mission</h2>
				<p>CitySeva is a civic technology platform that bridges the gap between citizens and local authorities. We empower residents to report and track civic issues like potholes, waterlogging, and streetlight malfunctions, ensuring faster resolution through AI-assisted identification and community engagement.</p>
				<div class="mission-stats">
					<div class="stat-item">
						<h3>20+</h3>
						<p>Issues Reported</p>
					</div>
					<div class="stat-item">
						<h3>85%</h3>
						<p>Resolution Rate</p>
					</div>
					<div class="stat-item">
						<h3>1</h3>
						<p>Cities Covered</p>
					</div>
				</div>
			</div>
		</div>
	`;

	return {
		content,
	};
})();
