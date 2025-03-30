const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const express = require("express");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

(async () => {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Shows QR Code in Railway Logs
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (m) => {
        if (!m.messages[0]?.message) return;
        const msg = m.messages[0];
        const sender = msg.key.remoteJid;
        const userMessage = msg.message.conversation?.toLowerCase();

        let botResponse = "Hello! How can I assist you? 🤖";

        if (userMessage.includes("help")) {
            botResponse = "Sure! What do you need help with? 🤔";
        } else if (userMessage.includes("price")) {
            botResponse = "Prices vary. Please specify the product name. 💰";
        }

        await sock.sendMessage(sender, { text: `${botResponse}\n\n*This is Auto response by AI*` });
    });

    console.log("Scan the QR code in Railway logs to connect!");

    setInterval(() => {
        fs.writeFileSync("keep_alive.txt", Date.now().toString()); // Prevents Railway from sleeping
    }, 5 * 60 * 1000); // Every 5 minutes

})();

app.get("/", (req, res) => {
    res.send("WhatsApp AI Bot is Running 24/7!");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
