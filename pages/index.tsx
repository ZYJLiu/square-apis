import { Button, Flex, VStack } from "@chakra-ui/react"
import axios from "axios"
import { useState } from "react"

export default function Home() {
  const [result, setResult] = useState(null)

  async function handlePayment() {
    try {
      const { data } = await axios.post("/api/makePayment")
      setResult(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <VStack justifyContent="center">
      <Button onClick={handlePayment}>Make Payment</Button>
      {result && <pre>Payment result: {JSON.stringify(result, null, 2)}</pre>}
    </VStack>
  )
}
