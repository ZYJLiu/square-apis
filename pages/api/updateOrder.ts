import type { NextApiRequest, NextApiResponse } from "next"
import { randomUUID } from "crypto"
import { redis } from "../../utils/redis"
import { Client, Environment } from "square"

//@ts-ignore
// Define the toJSON method for BigInt values
BigInt.prototype.toJSON = function () {
  return this.toString()
}

type OrderID = { orderID: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { orderID } = req.body as OrderID
    try {
      const test = await redis.get("test")
      console.log(test)

      const client = new Client({
        accessToken: test!,
        environment: Environment.Sandbox,
      })

      const location = await client.locationsApi.listLocations()

      if (location.result && location.result.locations) {
        const locationId = location.result.locations[0].id
        console.log(locationId)
        console.log(orderID)

        const response = await client.ordersApi.updateOrder(orderID, {
          order: {
            locationId: locationId!,
            discounts: [
              {
                name: "NFT Holder",
                percentage: "1",
                scope: "ORDER",
              },
            ],
            version: 1,
          },
          idempotencyKey: randomUUID(),
        })

        console.log(response.result)
        res.status(200).json(response.result)
      }
    } catch (error) {
      res.status(500).json({ error })
    }
  } else {
    res.status(405).send("Method Not Allowed")
  }
}
