import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export default function createRouter(projectRoot) {
    const router = Router();

    const DATA_FILE = path.join(projectRoot, "data", "links.json");
    const VIEWS_DIR = path.join(projectRoot, "views");

    // Load links
    const loadLinks = async () => {
        try {
            const data = await readFile(DATA_FILE, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                const empty = {};
                await writeFile(DATA_FILE, JSON.stringify(empty));
                return empty;
            }
            throw error;
        }
    };

    // Save links
    const saveLinks = async (links) => {
        await writeFile(DATA_FILE, JSON.stringify(links));
    };

    // GET /
    router.get("/", async (req, res) => {
        try {
            const file = await readFile(path.join(VIEWS_DIR, "index.html"));
            const links = await loadLinks();

            const content = file.toString().replace(
                "{{shortened_urls}}",
                Object.entries(links).map(([shortCode, url]) =>
                    `<li><a href="/${shortCode}" target="_blank">${req.hostname}/${shortCode}</a> - ${url}</li>`
                ).join("")
            );

            res.send(content);
        } catch (err) {
            console.error("🔴 ERROR in GET /", err);
            res.status(500).send("Internal Server Error");
        }
    });

    // POST /
    router.post("/", async (req, res) => {
        try {
            const { url, shortCode } = req.body;
            const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
            const links = await loadLinks();

            if (links[finalShortCode]) {
                return res.status(400).send("Shortcode already exists. Please choose another");
            }

            links[finalShortCode] = url;
            await saveLinks(links);
            res.redirect("/");
        } catch (error) {
            console.error("🔴 ERROR in POST /", error);
            res.status(500).send("Internal Server Error");
        }
    });

    // GET /:shortCode
    router.get("/:shortCode", async (req, res) => {
        try {
            const { shortCode } = req.params;
            const links = await loadLinks();

            if (!links[shortCode]) {
                return res.status(404).send("404 page not found");
            }

            res.redirect(links[shortCode]);
        } catch (error) {
            console.error("🔴 ERROR in GET /:shortCode", error);
            res.status(500).send("Internal Server Error");
        }
    });

    return router;
}
