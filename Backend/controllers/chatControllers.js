import { generateAIResponse } from "../services/aiService.js";

export const chatWithAi=async (req,res)=>{
    try {
        const {message}=req.body
        const reply=await generateAIResponse(message)
        res.json({reply})
    } catch (error) {
        console.log(error)
        res.status(500).json({error:"Ai Error"})
    }
}