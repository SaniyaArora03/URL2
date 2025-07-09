import express from 'express';
import router from "./router/shortener.route.js";
const app=express();
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use Render's port (no hardcoded fallback!)
const PORT = process.env.PORT||3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//template engine
app.set("view engine","ejs")


//serve files express
app.use(express.static(path.join(__dirname, "public")));

//express router
app.use(router(__dirname));

// // Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
