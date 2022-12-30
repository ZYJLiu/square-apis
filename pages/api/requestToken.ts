import { NextApiRequest, NextApiResponse } from "next"

var cookie = require("cookie")
const md5 = require("md5")

const scopes = [
  "ITEMS_READ",
  "MERCHANT_PROFILE_READ",
  "PAYMENTS_WRITE",
  "ORDERS_WRITE",
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  var state = md5(Date.now())
  var url =
    "https://connect.squareupsandbox.com/" +
    `oauth2/authorize?client_id=${process.env.SQUARE_APPLICATION_ID}&` +
    `response_type=code&` +
    `scope=${scopes.join("+")}` +
    `&state=` +
    state

  // Set the 'Auth_State' cookie with the state value
  const cookieOptions = {
    expires: new Date(Date.now() + 1),
    httpOnly: true,
  }
  const serializedCookieOptions = cookie.serialize(
    "Auth_State",
    state,
    cookieOptions
  )
  res.setHeader("Set-Cookie", serializedCookieOptions)

  // Return the OAuth URL and the query parameters to the client
  res.status(200).json({
    url,
  })
}
