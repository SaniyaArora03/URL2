import { createServer } from 'http';
import {readFile,writeFile} from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import express from 'express';
import { url } from 'inspector';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const app=express();

// // Fix ES Module __dirname
 const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use Render's port (no hardcoded fallback!)
const PORT = process.env.PORT||3000;

const DATA_FILE = path.join(__dirname, "data", "links.json");

// Load saved links from JSON file
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

// Save links to file
const saveLinks = async (links) => {
    await writeFile(DATA_FILE, JSON.stringify(links));
};
// Middleware for handling form and JSON data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


//serve files express
app.use(express.static(path.join( "public")));


// // Serve static files node
// const serveFile = async (res, filePath, contentType) => {
//     try {
//         const data = await readFile(filePath);
//         res.writeHead(200, { "Content-Type": contentType });
//         res.end(data);
//     } catch (error) {
//         res.writeHead(404, { 'Content-Type': 'text/html' });
//         res.end("404 page not found");
//     }
// };

//create server express
app.get("/",async(req,res)=>{
    try{
        //serving index.html file
        const file = await readFile(path.join(__dirname, "views", "index.html"));

        const links=await loadLinks();

        //replacing ul with string
        const content=file.toString().replace("{{shortened_urls}}", Object.entries(links).map(([shortCode, url]) => (
   `<li><a href="/${shortCode}" target="_blank">${req.hostname}/${shortCode}</a> - ${url}</li>`
)).join(""));

        return res.send(content);
    }catch(error){
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }

})


app.post("/",async(req,res)=>{
    try{
        const { url, shortCode } = req.body;
        const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
        const links = await loadLinks();
         
//if link already exists
    if (links[finalShortCode]){
                    return res.status(400).send("Shortcode already exists. Please choose another");
                }
                links[finalShortCode] = url;
                await saveLinks(links);
                return res.redirect("/");
    }catch(error){
        console.log(error);
    }
});
//redirection
app.get("/:shortCode",async(req,res)=>{
    try{
        const {shortCode}=req.params;
        const links=await loadLinks();
        if(!links[shortCode]) return res.status(404).send("404 page not found");
        return res.redirect(links[shortCode]);
        }catch(error){
            console.log(error);
            return res.status(500).send("Internal Server Error");
}});



// Create server node
// const server = createServer(async (req, res) => {
//     if (req.method === 'GET') {
//         if (req.url === '/') {
//             return serveFile(res, path.join(__dirname, "public", "index.html"), "text/html");
//         } else if (req.url === '/style.css') {
//             return serveFile(res, path.join(__dirname, "public", "style.css"), "text/css");
//         } else if (req.url === '/links') {
//             const links = await loadLinks();
//             res.writeHead(200, { 'Content-Type': 'application/json' });
//             res.end(JSON.stringify(links));
//         } else {
//             const links = await loadLinks();
//             const code = req.url.slice(1);
//             if (links[code]) {
//                 res.writeHead(302, { Location: links[code] });
//                 return res.end();
//             } else {
//                 res.writeHead(404, { 'Content-Type': 'text/plain' });
//                 return res.end("Shortcode not found");
//             }
//         }
//     }

//     if (req.method === 'POST' && req.url === '/shorten') {
//         const links = await loadLinks();

//         let body = "";
//         req.on('data', chunk => (body += chunk));

//         req.on('end', async () => {
//             try {
//                 const { url, shortCode } = JSON.parse(body);

//                 if (!url) {
//                     res.writeHead(400, { 'Content-Type': 'text/plain' });
//                     return res.end("url is required");
//                 }

//                 const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

//                 if (links[finalShortCode]) {
//                     res.writeHead(400, { "Content-Type": "text/plain" });
//                     return res.end("Shortcode already exists. Please choose another");
//                 }

//                 links[finalShortCode] = url;
//                 await saveLinks(links);

//                 res.writeHead(200, { "Content-Type": "application/json" });
//                 res.end(JSON.stringify({ shortCode: finalShortCode, url }));
//             } catch (err) {
//                 res.writeHead(400, { "Content-Type": "text/plain" });
//                 res.end("Invalid JSON");
//             }
//         });
//     }
// });

// // Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
