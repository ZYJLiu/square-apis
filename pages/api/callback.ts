import { NextApiRequest, NextApiResponse } from "next"

const { Client, Environment, ApiError } = require("square")

// Configure Square defcault client
const squareClient = new Client({
  environment: Environment.Sandbox,
})

const oauthInstance = squareClient.oAuthApi

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.query)
  res.json({ message: req.query })
}
