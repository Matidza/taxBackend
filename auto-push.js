import { execSync } from "child_process";

try {
  const commitMessage = process.argv[2] || "Auto commit 🚀";

  console.log("🔄 Adding changes...");
  execSync("git add .", { stdio: "inherit" });

  console.log(`💬 Committing with message: "${commitMessage}"`);
  execSync(`git commit -m "${commitMessage}"`, { stdio: "inherit" });

  console.log("⬆️ Pushing to remote...");
  execSync("git push origin main", { stdio: "inherit" });

  console.log("✅ Code pushed successfully!");
} catch (err) {
  console.error("❌ Error pushing code:", err.message);
}
