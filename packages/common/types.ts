import { z } from "zod";

export const TrainModel = z.object({
  name: z.string(),
  type: z.enum(["man", "woman", "others"]),
  age: z.number(),
  ethinicity: z.enum(["White", 
    "Black", 
    "Asian_American", 
    "East_Asian",
    "South_East_Asian", 
    "South_Asian", 
    "Middle_Eastern", 
    "Pacific", 
    "Hispanic"
  ]),
  eyeColor: z.enum(["Brown", "Blue", "Gray"]),
  bald: z.boolean(),
  zipUrl: z.string()
})

export const GenerateImage = z.object({
  prompt: z.string(),
  modelId: z.string(),
  num: z.number()
})

export const GenerateImageFromPack = z.object({
  modelId: z.string(),
  packId: z.string()
})