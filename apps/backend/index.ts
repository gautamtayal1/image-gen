import express from "express"
import {TrainModel, GenerateImage, GenerateImageFromPack} from "common/types"
import prisma from "db"
import {S3Client} from "bun"
import { FalAIModel } from "./models/FalAIModel"
 
const USER_ID = "123"
const PORT = process.env.PORT || 8080 
const falAiClient = new FalAIModel()
const app = express()
app.use(express.json())

app.get("/pre-signed-url", async (req, res) => {
  const url = S3Client.presign(`models/${Date.now()}_${Math.random()}.zip`, {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    endpoint: process.env.ENDPOINT,
    bucket: process.env.BUCKET_NAME,
    expiresIn: 60 * 5
  })
  res.json({
    url
  })
})

app.post("/ai/training", async(req,res) => {
  const parsedBody = TrainModel.safeParse(req.body)
  if(!parsedBody.success) {
    res.status(411).json({
      message: "Input Incorrect"
    })
    return
  }
  const {request_id, response_url} = await FalAIModel.trainModel("", parsedBody.data.name)

  const data = await prisma.model.create({
    data: {
      name: parsedBody.data.name,
      type: parsedBody.data.type,
      age: parsedBody.data.age,
      ethinicity: parsedBody.data.ethinicity,
      eyeColor: parsedBody.data.eyeColor,
      bald: parsedBody.data.bald,
      userId: USER_ID, 
      zipUrl: parsedBody.data.zipUrl,
      falAiRequestId: request_id
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
  const model = await prisma.model.findUnique({
    where: {
      id: parsedBody.data.modelId
    }
  })
  if(!model || !model.tensorPath) {
    res.status(411).json({
      message: "Model not found"
    })
    return
  }
  const {request_id, response_url} = await falAiClient.generateImage(parsedBody.data.prompt, model.tensorPath) 
  const data = await prisma.outputImages.create({
    data: {
      modelId: parsedBody.data.modelId,
      prompt: parsedBody.data.prompt,
      imageUrl: "",
      userId: USER_ID,
      falAiRequestId: request_id
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

  let requestIds: {request_id: string}[] = await Promise.all(prompts.map((prompt) => FalAIModel.generateImage(prompt.prompt, parsedBody.data.modelId)))
    
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
app.post("/fal-ai/webhook/train", async(req, res) => {
  console.log(req.body)
  const requestId = req.body.request_id
  await prisma.model.updateMany({
    where: {
      falAiRequestId: requestId
    },
    data: {
      trainingStatus: "Generated",
      tensorPath: req.body.tensor_path 
    }
  })
  res.json({
    message: "webhook received"
})
})
app.post("/fal-ai/webhook/image", async(req, res) => {
  console.log(req.body)
  const requestId = req.body.request_id
  await prisma.outputImages.updateMany({
    where: {
      falAiRequestId: requestId
    },
    data: {
      status: "Generated",
      imageUrl: req.body.image_url
    }
  })
  res.json({
    message: "webhook received"
  })
})


app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`)
}) 