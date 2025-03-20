import express from "express"
import {TrainModel, GenerateImage, GenerateImageFromPack} from "common/types"
import prisma from "db"

const PORT = process.env.PORT || 8080 

const app = express()

app.post("/ai/training", (req,res) => {

})

app.post("/ai/generate", (req,res) => {
 
})

app.post("/pack/generate", (req,res) => {

})

app.post("/pack/bulk", (req,res) => {

})

app.post("/image", (req,res) => {

})





app.get("/", (req,res) => {
  res.send("hello world")
})

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
}) 