import express from 'express'
import { chatWithAi } from '../controllers/chatControllers.js'

const router=express.Router()

router.post('/',chatWithAi)

export default router