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
  TableContainer,
  Table,
  Tr,
  Td,
  TableCaption,
  Thead,
  Th,
  Tbody,
  Flex,
  Code,
  useDisclosure,
} from "@chakra-ui/react"
import axios from "axios"
import { useState, useEffect } from "react"
import QrModal from "../components/QrCodeTest"

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [result, setResult] = useState<CatalogData | null>(null)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [items, setItems] = useState<{ [key: string]: Item }>({})
  const [total, setTotal] = useState(0)

  const [resultOrder, setResultOrder] = useState<Order | null>(null)
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)

  const [resultPayment, setResultPayment] = useState<Payment | null>(null)
  const [confirmed, setConfirmed] = useState(false)

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
  // Run fetchCatalog when the component mounts
  useEffect(() => {
    fetchCatalog()
  }, [])

  function handleChange(event: string, id: string) {
    const value = Number(event)
    const updatedItems = { ...items }
    updatedItems[id].quantity = value
    setItems(updatedItems)
    setQuantities({ ...quantities, [id]: value })

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
    console.log(items)
    calculateTotal()
  }, [items])

  function calculateTotal() {
    let totalAmount = 0
    Object.values(items).forEach((item) => {
      if (item.quantity > 0) {
        totalAmount += (Number(item.price) * item.quantity) / 100
      }
    })
    setTotal(totalAmount)
  }

  async function handleCreateOrder() {
    try {
      const { data } = await axios.post("/api/createOrderTest", { quantities })
      const orderId = data.order.id
      const netAmountDueAmount = data.order.netAmountDueMoney.amount
      setResultOrder(data)
      setOrderDetail({ orderId, netAmountDueAmount })
    } catch (error) {
      console.error(error)
    }
  }

  async function handlePayment() {
    try {
      // console.log(orderDetail)
      // console.log(orderDetail?.netAmountDueAmount)
      // console.log(orderDetail?.orderId)
      const { data } = await axios.post("/api/makePaymentTest", {
        orderDetail,
      })
      setResultPayment(data)
    } catch (error) {
      console.error(error)
    }
  }

  // Run fetchCatalog when the component mounts
  // useEffect(() => {
  //   handlePayment()
  // }, [orderDetail])

  useEffect(() => {
    handlePayment()
  }, [confirmed])

  return (
    <VStack>
      <HStack alignItems="top" justifyContent="center">
        <VStack alignItems="top">
          <Table variant="simple">
            <TableCaption fontWeight="bold" placement="top">
              Item Selection
            </TableCaption>
            <Thead>
              <Tr>
                <Th>Item</Th>
                <Th>Description</Th>
                <Th>Price</Th>
                <Th>Quantity</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.keys(items).map((key) => {
                const item = items[key] as Item
                return (
                  <Tr key={item.variationId}>
                    <Td>{item.name}</Td>
                    <Td>{item.description}</Td>
                    <Td isNumeric>
                      ${(item.price as unknown as number) / 100}
                    </Td>
                    <Td>
                      <NumberInput
                        width={20}
                        step={1}
                        min={0}
                        max={30}
                        value={quantities[item.variationId] || 0}
                        onChange={(event) =>
                          handleChange(event, item.variationId)
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </VStack>

        <TableContainer>
          <Table variant="simple">
            <TableCaption fontWeight="bold" placement="top">
              Checkout
            </TableCaption>
            <Thead>
              <Tr>
                <Th>Item</Th>
                <Th>Quantity</Th>
                <Th isNumeric>Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.values(items).map((item) => {
                if (item.quantity > 0) {
                  return (
                    <Tr key={item.variationId}>
                      <Td>{item.name}</Td>
                      <Td>{item.quantity}</Td>
                      <Td isNumeric>
                        {(Number(item.price) * item.quantity) / 100}
                      </Td>
                    </Tr>
                  )
                }
              })}
              <Tr style={{ borderTopWidth: "4px", borderTopColor: "black" }}>
                <Td colSpan={2} textAlign="right">
                  Total
                </Td>
                <Td isNumeric>{total}</Td>
              </Tr>
              <Tr>
                <Td textAlign="center" colSpan={3}>
                  <Button onClick={handleCreateOrder}>Checkout</Button>
                </Td>
              </Tr>
              <Tr>
                <Td textAlign="center" colSpan={3}>
                  <Button
                    onClick={() => {
                      onOpen()
                      handleCreateOrder()
                    }}
                  >
                    Solana Pay
                  </Button>
                  {isOpen && (
                    <QrModal
                      onClose={() => {
                        onClose()
                        // setResultOrder(null)
                        // setOrderDetail(null)
                        // setResultPayment(null)
                      }}
                      value={total}
                      confirmed={confirmed}
                      setConfirmed={setConfirmed}
                    />
                  )}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </HStack>
      <HStack alignItems="top" justifyContent="center">
        {resultOrder && orderDetail && (
          <VStack>
            <Text>Order ID: {orderDetail?.orderId}</Text>
            <Code whiteSpace="pre" fontFamily="mono">
              {JSON.stringify(resultOrder, null, 2)}
            </Code>
          </VStack>
        )}

        {resultPayment && (
          <VStack>
            <Text>Payment ID: {resultPayment.payment.id}</Text>
            <Code whiteSpace="pre" fontFamily="mono">
              {JSON.stringify(resultPayment, null, 2)}
            </Code>
          </VStack>
        )}
      </HStack>
    </VStack>
  )
}

type OrderDetail = {
  orderId: string
  netAmountDueAmount: string
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

interface Payment {
  payment: {
    id: string
    createdAt: string
    amountMoney: {
      amount: string
      currency: string
    }
    totalMoney: {
      amount: string
      currency: string
    }
    status: string
    sourceType: string
    externalDetails: {
      type: string
      source: string
      sourceFeeMoney: {
        amount: string
        currency: string
      }
    }
    locationId: string
    orderId: string
    capabilities: string[]
    receiptNumber: string
    receiptUrl: string
    applicationDetails: {
      squareProduct: string
      applicationId: string
    }
    versionToken: string
  }
}
