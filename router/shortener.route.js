import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import crypto from 'crypto';
//controller
import {postURLShortener,getShortnerPage, redirectToShortLink} from "../controllers/postShorten.js";

export default function createRouter() {
    const router = Router();

    

    // //template engine
    // router.get("/report",(req,res)=>{
    //     const student=[{
    //         name:"Aarav",
    //         grade:"10th"
    //     },
    // {
    //         name:"Aaisha",
    //         grade:"9th"
    //     },
    // {
    //         name:"Aman",
    //         grade:"11th"
    //     }];
    //    return res.render("report",{student});
    // })


    // GET /
    router.get("/", getShortnerPage);//controller

    // POST /

    router.post("/", postURLShortener);  //controller

    // GET /:shortCode
        router.get("/:shortCode",redirectToShortLink);//controller
    

    return router;
}
