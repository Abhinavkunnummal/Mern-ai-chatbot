import express from 'express'
import cors from 'cors'
import chatRoute from './routes/chatRoute.js'


const app=express()

app.use(cors())
app.use(express.json())

app.use("/api/chat",chatRoute)

app.listen(5000,()=>{
    console.log('Server is Running on Port 5000')
})