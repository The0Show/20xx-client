// Modules to control application life and create native browser window
const {
	app,
	BrowserWindow,
	Menu,
	globalShortcut,
	shell,
	dialog,
	ipcMain,
} = require("electron");
const path = require("path");

const instanceCheck = app.requestSingleInstanceLock();
if (!instanceCheck) {
	console.log("Quitting due to a pre-existing instance");
	app.quit();
	return;
}

app.commandLine.appendArgument("--no-user-gesture-required");

/**
 * @type {BrowserWindow}
 */
let mainWindow;

let errorReport = {
	title: "",
	body: "",
	log: "",
};

function openErrorReporting() {
	shell.openExternal(
		`https://github.com/The0Show/20xx-client/issues/new?title=${
			errorReport.title
		}&body=${errorReport.body}\n--------------------\n${Buffer.from(
			errorReport.log
		).toString("base64url")}`
	);
}

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		webPreferences: {
			preload: path.join(__dirname, "hook.js"),
			webgl: true,
			nodeIntegration: true,
		},
		icon: path.join(__dirname, "icon.png"),
	});

	Menu.setApplicationMenu(null);

	const crashReasons = {
		"abnormal-exit":
			"The rendered has exited with a non-zero exit code. If this keeps happening, report this on our GitHub (press F8).",
		killed:
			"The renderer process was terminated unexpectedly. If this keeps happening, report this on our GitHub (press F8).",
		crashed:
			"The Chromium engine has crashed. If this keeps happening, report this on our GitHub (press F8).",
		oom: "20XX has ran out of memory. If this keeps happening, report this on our GitHub (press F8).",
		"launch-failure":
			"20XX failed to launch. If this keeps happening, report this on our GitHub (press F8).",
		"integrity-failure":
			"Code integrity checks failed. If this keeps happening, report this on our GitHub (press F8).",
	};
	mainWindow.webContents.on("render-process-gone", (e, details) => {
		if (details.reason === "clean-exit") {
			return;
		}

		dialog.showMessageBoxSync({
			message: "Oops...",
			detail: `${
				crashReasons[details.reason] ||
				`The renderer has crashed with an unknown reason (${details.reason}). Please report this on our GitHub (press F8).`
			}`,
			type: "error",
		});
	});

	// and load the index.html of the app.
	mainWindow.loadURL(
		`${path.join(__dirname, "splash.html")}#${Buffer.from(
			process.argv.toString(),
			"utf8"
		).toString("base64url")}`
	);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow();

	mainWindow.webContents.on("new-window", function (e, url) {
		e.preventDefault();
		shell.openExternal(url);
	});
});

// I learned this on StackOverflow (of course), but this fixes the problem of
// shortcuts working when the user isn't focused on the app, by registering the
// shortcuts when the window is focused, and unregistering them when the window
// is unfocused.
app.on("browser-window-focus", () => {
	globalShortcut.register("Control+R", () => {
		app.relaunch();
		app.exit();
	});

	globalShortcut.register("Control+Shift+R", () => {
		mainWindow.reload();
	});

	globalShortcut.register("Control+Shift+I", () => {
		mainWindow.webContents.openDevTools();
	});

	globalShortcut.register("F8", () => {
		openErrorReporting();
	});

	globalShortcut.register("Shift+F8", () => {
		shell.showItemInFolder(
			`${app.getPath("appData")}\\20xx-client\\Logs\\${logId}.log`
		);
	});
});

app.on("browser-window-blur", () => {
	globalShortcut.unregisterAll();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	app.quit();
});

ipcMain.handle("updateCheck", (event, args) => {
	if (!app.isPackaged) return ["Hello life waster, update skipped", 3000];
	try {
		throw new ReferenceError("Happiness is not defined");
	} catch (err) {
		return [`${err}\nPlease report this! 20XX will not continue load.`, -1];
	}
});
