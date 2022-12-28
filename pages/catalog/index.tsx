import { Box, Button, Heading, HStack, VStack, Text } from "@chakra-ui/react"
import { useState } from "react"
import axios from "axios"

export default function Catalog() {
  const [result, setResult] = useState<CatalogData | null>(null)

  async function handleFetchCatalog() {
    try {
      const { data } = await axios.post("/api/fetchCatalog")
      setResult(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <VStack justifyContent="center">
      <Button onClick={handleFetchCatalog}>Fetch Catalog</Button>
      <HStack alignItems="top">
        {result && <pre>Catalog result: {JSON.stringify(result, null, 2)}</pre>}

        <VStack>
          {result &&
            result.objects.map((object) => (
              <Box key={object.itemData.variations[0].id}>
                <Heading as="h2">{object.itemData.name}</Heading>
                <Text>{object.itemData.description}</Text>
                <Text>
                  {
                    object.itemData.variations[0].itemVariationData.priceMoney
                      .amount
                  }
                </Text>
                <Text>{object.itemData.variations[0].id}</Text>
              </Box>
            ))}
        </VStack>
      </HStack>
    </VStack>
  )
}

interface CatalogData {
  objects: {
    type: string
    id: string
    updatedAt: string
    version: string
    isDeleted: boolean
    presentAtAllLocations: boolean
    itemData: {
      name: string
      description: string
      labelColor: string
      categoryId: string
      variations: {
        type: string
        id: string
        updatedAt: string
        version: string
        isDeleted: boolean
        presentAtAllLocations: boolean
        itemVariationData: {
          itemId: string
          name: string
          sku: string
          ordinal: number
          pricingType: string
          priceMoney: {
            amount: string
            currency: string
          }
          trackInventory: boolean
          sellable: boolean
          stockable: boolean
        }
      }[]
      productType: string
      skipModifierScreen: boolean
      imageIds: string[]
      descriptionHtml: string
      descriptionPlaintext: string
    }
  }[]
}
