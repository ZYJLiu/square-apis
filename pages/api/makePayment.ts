// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { randomUUID } from "crypto"

import { Client, Environment } from "square"

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
          amount: 400,
          currency: "USD",
        },
        // orderId: "uQmaFNKSCVYym08Y2LOuzwAt6f4F",
        externalDetails: {
          type: "CRYPTO",
          source: "USDC",
          sourceFeeMoney: {
            amount: 400,
            currency: "USD",
          },
        },
      })
      console.log(response.result)
      res.status(200).json(response.result)
    } catch (error) {
      res.status(500).json({ error })
    }
  } else {
    res.status(405).send("Method Not Allowed")
  }
}
