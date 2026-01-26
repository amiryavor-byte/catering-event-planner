const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
// Load envs in order of priority: .env.production.local -> .env.local -> .env
require("dotenv").config({ path: ".env.production.local" });
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const LOCAL_ROOT = path.join(__dirname, "../php_api");
const REMOTE_ROOT = process.env.FTP_REMOTE_ROOT || "/public_html/catering_app";
const HEALTH_CHECK_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/company.php`
    : "https://api.jewishingenuity.com/catering_app/company.php";

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        console.log("🚀 Starting deployment...");
        console.log(`📂 Local source: ${LOCAL_ROOT}`);
        console.log(`☁️ Remote target: ${REMOTE_ROOT}`);

        // Check for required env vars
        // Default to the known IP from DEPLOYMENT.md if no host is set
        const host = "75.203.51.130";
        const user = process.env.FTP_USER;
        const password = process.env.FTP_PASSWORD || process.env.FTP_PASS;

        // Remote path fallback
        const remoteRoot = process.env.FTP_REMOTE_ROOT || "/public_html/catering_app";

        if (!user || !password) {
            throw new Error("❌ Missing FTP credentials (FTP_USER, FTP_PASSWORD)");
        }

        console.log(`🔌 Connecting to ${host} as ${user}...`);

        await client.access({
            host: host,
            user: user,
            password: password,
            secure: false, // Disable FTPS to avoid timeouts
            accessTimeout: 60000,
        });

        console.log("✅ Authenticated");

        // Ensure remote directory exists
        await client.ensureDir(REMOTE_ROOT);

        // Clear directory is risky without confirmation, so we'll just overwrite.
        // basic-ftp uploadFromDir overwrites by default.

        console.log("⬆️ Uploading files...");
        await client.uploadFromDir(LOCAL_ROOT, REMOTE_ROOT);

        console.log("✅ Upload complete");

    } catch (err) {
        console.error("❌ Deployment failed:", err);
        process.exit(1);
    } finally {
        client.close();
    }

    // Health Check
    const { performHealthCheck } = require("./health-check");
    await performHealthCheck();
}

deploy();
