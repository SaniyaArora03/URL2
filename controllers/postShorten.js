import crypto from 'crypto';
import { loadLinks,saveLinks } from '../models/model.js';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIEWS_DIR = path.join(__dirname, "../views");

export const getShortnerPage=async (req, res) => {
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
    }


export const postURLShortener=async(req,res)=>{ 
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
        };

export const redirectToShortLink = async (req, res) => {
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
            }}
    
        
