// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { randomUUID } from "crypto"

const { Client, Environment, ApiError } = require("square")

// Initialize the Square client with the access token and sandbox environment
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
})

//@ts-ignore
// Define the toJSON method for BigInt values
BigInt.prototype.toJSON = function () {
  return this.toString()
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const response = await client.paymentsApi.createPayment({
        sourceId: "EXTERNAL",
        idempotencyKey: randomUUID(),
        amountMoney: {
          amount: 123,
          currency: "USD",
        },
        externalDetails: {
          type: "CRYPTO",
          source: "USDC",
          sourceFeeMoney: {
            amount: 123,
            currency: "USD",
          },
        },
      })
      res.status(200).json(response.result)
    } catch (error) {
      res.status(500).json({ error })
    }
  } else {
    res.status(405).send("Method Not Allowed")
  }
}
