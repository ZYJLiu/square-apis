import { Button, VStack, Text, Link, Code } from "@chakra-ui/react"
import axios from "axios"
import { useEffect, useState } from "react"

export default function OAuth() {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/requestToken")
        setUrl(res.data.url)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [])

  return (
    <VStack justifyContent="center">
      {url && (
        <Button as={Link} href={url}>
          OAuth
        </Button>
      )}
      <Code whiteSpace="pre" fontFamily="mono">
        {url}
      </Code>
    </VStack>
  )
}
