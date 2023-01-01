import { NextApiRequest, NextApiResponse } from "next"
import { redis } from "../../utils/redis"

import { Client, Environment } from "square"

const squareClient = new Client({
  environment: Environment.Sandbox,
})

const oauthInstance = squareClient.oAuthApi

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.query)

  if (req.query.response_type === "code") {
    // Extract the returned authorization code from the URL
    var { code } = req.query

    try {
      if (typeof code === "string") {
        let { result } = await oauthInstance.obtainToken({
          // Provide the code in a request to the obtain access token
          code,
          clientId: process.env.SQUARE_APPLICATION_ID!,
          clientSecret: process.env.SQUARE_APPLICATION_SECRET,
          grantType: "authorization_code",
          shortLived: true,
        })

        console.log(result)

        let {
          // Extract the returned access token from the ObtainTokenResponse object
          accessToken,
          refreshToken,
          expiresAt,
          merchantId,
        } = result

        if (typeof accessToken === "string") {
          redis.set("test", accessToken)
        } else {
          console.error("Access token is undefined")
        }

        res.json({ accessToken })
      }
    } catch (e) {}
  }
}

// res.redirect("https://ae5c-104-202-147-35.ngrok.io")
