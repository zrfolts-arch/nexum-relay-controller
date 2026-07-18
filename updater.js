const { spawn } = require("child_process");

function runCommand(command, args, cwd, onLog) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, shell: true });

    proc.stdout.on("data", (data) => onLog(data.toString()));
    proc.stderr.on("data", (data) => onLog(data.toString()));

    proc.on("error", (err) => {
      reject(new Error(`Failed to run ${command}: ${err.message}`));
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
      }
    });
  });
}

async function pullAndInstall(projectPath, onLog) {
  onLog(`\n--- Pulling latest changes in ${projectPath} ---`);
  await runCommand("git", ["pull"], projectPath, onLog);

  onLog(`\n--- Installing dependencies ---`);
  await runCommand("npm", ["install"], projectPath, onLog);
}

async function runBuild(projectPath, onLog) {
  onLog(`\n--- Building project ---`);
  await runCommand("npm", ["run", "build"], projectPath, onLog);
}

module.exports = {
  pullAndInstall,
  runBuild,
  runCommand,
};