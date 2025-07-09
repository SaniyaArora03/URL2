import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = __dirname;

const DATA_FILE = path.join(projectRoot, "data", "links.json");
    const VIEWS_DIR = path.join(projectRoot, "views");

    // Load links
 export   const loadLinks = async () => {
        try {
            const data = await readFile(DATA_FILE, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await mkdir(path.dirname(DATA_FILE), { recursive: true });  //create directory if it doesnt exist
                const empty = {};
                await writeFile(DATA_FILE, JSON.stringify(empty));
                return empty;
            }
            throw error;
        }
    };

    // Save links
 export   const saveLinks = async (links) => {
        await writeFile(DATA_FILE, JSON.stringify(links));
    };