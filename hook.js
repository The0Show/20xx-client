const { app, ipcRenderer } = require("electron");

async function myPreciousHook() {
	if (window.location.href.includes("splash.html")) {
		document.getElementById("status").innerText = "Checking for updates...";

		const updateCheck = await ipcRenderer.invoke("updateCheck", []);
		document.getElementById("status").innerText = updateCheck[0];

		if (updateCheck[1] >= 0) {
			setTimeout(() => {
				document.getElementById("status").innerText = "Starting...";

				setTimeout(() => {
					const params = atob(window.location.href.split("#")[1]);

					if (params.includes("--mapeditor")) {
						window.location.replace("https://20xx.io/nxc/editor/");
					} else if (params.includes("--aquarium")) {
						window.location.replace(
							"https://webglsamples.org/aquarium/aquarium.html"
						);
					} else if (params.includes("--conformance")) {
						window.location.replace(
							"https://registry.khronos.org/webgl/sdk/tests/webgl-conformance-tests.html"
						);
					} else if (params.includes("--fluid")) {
						window.location.replace(
							"https://paveldogreat.github.io/WebGL-Fluid-Simulation/"
						);
					} else if (params.includes("--feecof")) {
						window.location.replace("https://feecof.osk.sh/");
					} else {
						window.location.replace("https://20xx.io");
					}
				}, 500);
			}, updateCheck[1]);
		}
	} else {
	}
}

const sockets = [];
const nativeWebSocket = window.WebSocket;
window.WebSocket = function (...args) {
	const socket = new nativeWebSocket(...args);

	socket.on("message", (event) => {
		console.log(event.data);
	});

	return socket;
};

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", myPreciousHook);
} else {
	myPreciousHook();
	console.log(sockets);
}
