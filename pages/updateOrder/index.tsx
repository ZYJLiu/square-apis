import {
  Box,
  Button,
  Heading,
  HStack,
  VStack,
  Text,
  Input,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import axios from "axios"

export default function UpdateOrder() {
  const [result, setResult] = useState<Order | null>(null)
  const [orderID, setOrderID] = useState("")

  async function handleUpdateOrder() {
    try {
      const { data } = await axios.post("/api/updateOrder", {
        orderID,
      })
      setResult(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    console.log(orderID)
  }, [orderID])

  return (
    <VStack justifyContent="center">
      <Input
        placeholder="Order ID"
        width="300px"
        value={orderID}
        onChange={(e) => setOrderID(e.target.value)}
      />
      <Button onClick={handleUpdateOrder}>Update Order</Button>
      <HStack alignItems="top">
        {result && <pre>Order result: {JSON.stringify(result, null, 2)}</pre>}
        {result && (
          <VStack>
            <Heading>Order ID</Heading>
            <Text>{result.order.id}</Text>
          </VStack>
        )}
      </HStack>
    </VStack>
  )
}

interface Order {
  order: {
    id: string
    locationId: string
    source: {
      name: string
    }
    lineItems: {
      uid: string
      name: string
      quantity: string
      catalogObjectId: string
      catalogVersion: string
      variationName: string
      itemType: string
      basePriceMoney: {
        amount: string
        currency: string
      }
      variationTotalPriceMoney: {
        amount: string
        currency: string
      }
      grossSalesMoney: {
        amount: string
        currency: string
      }
      totalTaxMoney: {
        amount: string
        currency: string
      }
      totalDiscountMoney: {
        amount: string
        currency: string
      }
      totalMoney: {
        amount: string
        currency: string
      }
      appliedDiscounts: {
        uid: string
        discountUid: string
        appliedMoney: {
          amount: string
          currency: string
        }
      }[]
    }[]
    netAmounts: {
      totalMoney: {
        amount: string
        currency: string
      }
      taxMoney: {
        amount: string
        currency: string
      }
      discountMoney: {
        amount: string
        currency: string
      }
      tipMoney: {
        amount: string
        currency: string
      }
      serviceChargeMoney: {
        amount: string
        currency: string
      }
    }
    createdAt: string
    updatedAt: string
    state: string
    version: number
    totalMoney: {
      amount: string
      currency: string
    }
    totalTaxMoney: {
      amount: string
      currency: string
    }
    totalDiscountMoney: {
      amount: string
      currency: string
    }
    totalTipMoney: {
      amount: string
      currency: string
    }
    totalServiceChargeMoney: {
      amount: string
      currency: string
    }
    netAmountDueMoney: {
      amount: string
      currency: string
    }
  }
}
