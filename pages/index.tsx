import {
  Box,
  Button,
  Text,
  Heading,
  HStack,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Tr,
  Td,
} from "@chakra-ui/react"
import axios from "axios"
import { useState, useEffect } from "react"

export default function Home() {
  const [result, setResult] = useState<CatalogData | null>(null)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [items, setItems] = useState<{ [key: string]: object }>({})

  async function fetchCatalog() {
    try {
      const { data } = await axios.post("/api/fetchCatalog")
      const itemsData = data.objects.reduce(
        (acc: { [key: string]: object }, item: ItemData) => {
          const { id, itemData } = item
          const { name, variations, description } = itemData
          const variation = variations[0]
          const { id: variationId, itemVariationData } = variation
          const { priceMoney } = itemVariationData
          acc[variationId] = {
            id,
            name,
            description,
            variationId,
            price: priceMoney.amount,
            quantity: 0,
          }
          return acc
        },
        {}
      )
      setItems(itemsData)
      setResult(data)
    } catch (error) {
      console.error(error)
    }
  }

  console.log(items)
  // Run fetchCatalog when the component mounts
  useEffect(() => {
    fetchCatalog()
  }, [])

  function handleChange(event: string, id: string) {
    const value = Number(event)
    if (value === 0) {
      // Remove the key from quantities
      const updatedQuantities = { ...quantities }
      delete updatedQuantities[id]
      setQuantities(updatedQuantities)
    } else {
      setQuantities({ ...quantities, [id]: value })
    }
  }

  // Run fetchCatalog when the component mounts
  useEffect(() => {
    console.log(quantities)
  }, [quantities])

  return (
    <VStack justifyContent="center">
      <HStack alignItems="top">
        {Object.keys(items).map((key) => {
          const item = items[key] as Item
          return (
            <Box key={item.variationId}>
              <Heading as="h2">{item.name}</Heading>
              <Text>{item.description}</Text>
              <Text>Price: ${(item.price as unknown as number) / 100}</Text>
              <NumberInput
                step={1}
                min={0}
                max={30}
                value={quantities[item.variationId] || 0}
                onChange={(event) => handleChange(event, item.variationId)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
          )
        })}
      </HStack>
    </VStack>
  )
}

// {result && <pre>Catalog result: {JSON.stringify(result, null, 2)}</pre>}
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

interface Item {
  id: string
  name: string
  description: string
  variationId: string
  price: string
  quantity: number
}

type ItemData = {
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
    variations: [
      {
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
      }
    ]
    productType: string
    skipModifierScreen: boolean
    imageIds: string[]
    descriptionHtml: string
    descriptionPlaintext: string
  }
}
