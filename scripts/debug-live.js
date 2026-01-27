const fetch = require('node-fetch'); // Assuming node-fetch is available or using built-in fetch in newer node
// If node-fetch is not available, we can use built-in fetch since we are in node 18+ environment usually.
// But just in case, let's use standard global fetch if available.

const API_BASE = "https://api.jewishingenuity.com/catering_app";

const ENDPOINTS = [
    "/company.php",
    "/events.php",
    "/users.php",
    "/menus.php",
    "/staff.php"
];

async function checkEndpoints() {
    console.log(`🔍 Probing API at ${API_BASE}...\n`);

    for (const endpoint of ENDPOINTS) {
        const url = `${API_BASE}${endpoint}`;
        try {
            const start = Date.now();
            const res = await fetch(url);
            const duration = Date.now() - start;

            const statusIcon = res.ok ? "✅" : "❌";
            console.log(`${statusIcon} ${endpoint} - Status: ${res.status} (${duration}ms)`);

            if (!res.ok) {
                console.log(`   Response: ${await res.text()}`);
            } else {
                // Try parsing JSON
                try {
                    const text = await res.text();
                    // Basic sanity check for valid JSON
                    JSON.parse(text);
                    console.log(`   JSON: Valid (Length: ${text.length} chars)`);
                } catch (e) {
                    console.log(`   ⚠️  Invalid JSON received!`);
                    console.log(`   Preview: ${text.substring(0, 100)}...`);
                }
            }
        } catch (err) {
            console.log(`❌ ${endpoint} - Network Error: ${err.message}`);
        }
    }
}

checkEndpoints();
