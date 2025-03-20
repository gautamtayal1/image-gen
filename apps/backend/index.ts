import express from "express"
import {TrainModel, GenerateImage, GenerateImageFromPack} from "common/types"
import prisma from "db"

const USER_ID = "123"

const PORT = process.env.PORT || 8080 

const app = express()
app.use(express.json())

app.post("/ai/training", async(req,res) => {
  const parsedBody = TrainModel.safeParse(req.body)
  if(!parsedBody.success) {
    res.status(411).json({
      message: "Input Incorrect"
    })
    return
  }
  const data = await prisma.model.create({
    data: {
      name: parsedBody.data.name,
      type: parsedBody.data.type,
      age: parsedBody.data.age,
      ethinicity: parsedBody.data.ethinicity,
      eyeColor: parsedBody.data.eyeColor,
      bald: parsedBody.data.bald,
      userId: USER_ID
    }
  })
  res.status(200).json({
    modelId: data.id
  })
})
app.post("/ai/generate", async(req,res) => {
  const parsedBody = GenerateImage.safeParse(req.body)
  if(!parsedBody.success) {
    res.status(411).json({
      message: "Input Incorrect"
    })
    return
  }
  const data = await prisma.outputImages.create({
    data: {
      modelId: parsedBody.data.modelId,
      prompt: parsedBody.data.prompt,
      imageUrl: "",
      userId: USER_ID
    }
  })
  res.status(200).json({
    imageId: data.id
  })
})
app.post("/pack/generate", async(req,res) => {
  const parsedBody = GenerateImageFromPack.safeParse(req.body)
  if(!parsedBody.success) {
    res.status(411).json({
      message: "input incorrect"
    })
    return
  }
  const prompts = await prisma.packPrompts.findMany({
    where: {
      packId: parsedBody.data.packId
    }
  })
  const images = await prisma.outputImages.createManyAndReturn({
    data: prompts.map((prompt) => ({
      prompt: prompt.prompt,
      imageUrl: "",
      userId: USER_ID,
      modelId: parsedBody.data.modelId
    }))
  })
  res.json({
    images: images.map((image) => image.id)
  })
})
app.post("/pack/bulk", async(req,res) => {
  const packs = await prisma.packs.findMany({})  
  res.json({packs})
})
app.post("/image/bulk", async(req,res) => {
  const ids = req.query.ids as string[]
  const limit = req.query.limit as string ?? "10"
  const offset = req.query.offset as string ?? "0"
  const imagesData = await prisma.outputImages.findMany({
    where: {
      id: {in: ids},
      userId: USER_ID
    },
    skip: parseInt(offset),
    take: parseInt(limit)
  })
  res.json({images: imagesData})
})



app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
}) 