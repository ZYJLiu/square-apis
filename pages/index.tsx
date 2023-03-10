import {
  Button,
  Text,
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
import {
  CatalogData,
  Item,
  Items,
  ItemData,
  Order,
  OrderDetail,
  Payment,
} from "../utils/square"

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [result, setResult] = useState<CatalogData | null>(null)
  const [items, setItems] = useState<{ [key: string]: Item }>({})
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
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
          const {
            id,
            itemData: { name, variations, description },
          } = item
          const {
            id: variationId,
            itemVariationData: {
              priceMoney: { amount },
            },
          } = variations[0]
          acc[variationId] = {
            id,
            name,
            description,
            variationId,
            price: amount,
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

    // Update quantities with the new value or remove the key if value is 0
    if (value === 0) {
      const { [id]: removed, ...updatedQuantities } = quantities
      setQuantities(updatedQuantities)
    } else {
      setQuantities({ ...quantities, [id]: value })
    }
  }

  function calculateTotal() {
    const totalAmount = Object.values(items).reduce((acc, item) => {
      return item.quantity > 0
        ? acc + (Number(item.price) * item.quantity) / 100
        : acc
    }, 0)
    setTotal(totalAmount)
  }

  // Run fetchCatalog when the component mounts
  useEffect(() => {
    calculateTotal()
    console.log(quantities)
    console.log(items)
  }, [items])

  async function handleCreateOrder() {
    try {
      const { data } = await axios.post("/api/createOrderTest", { quantities })
      const {
        order: {
          id: orderId,
          netAmountDueMoney: { amount: netAmountDueAmount },
        },
      } = data
      setResultOrder(data)
      setOrderDetail({ orderId, netAmountDueAmount })
    } catch (error) {
      console.error(error)
    }
  }

  async function handlePayment() {
    try {
      const { data } = await axios.post("/api/makePaymentTest", { orderDetail })
      setResultPayment(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (confirmed) handlePayment()
  }, [confirmed])

  // Run fetchCatalog when the component mounts
  // useEffect(() => {
  //   handlePayment()
  // }, [orderDetail])

  const resetState = () => {
    setResultOrder(null)
    setOrderDetail(null)
    setResultPayment(null)
    setQuantities({})
    setTotal(0)

    const resetItems: Items = Object.entries(items).reduce(
      (acc: Items, [id, item]) => {
        acc[id] = { ...item, quantity: 0 }
        return acc
      },
      {}
    )

    setItems(resetItems)
  }

  return (
    <VStack display="flex" width="100%">
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
                const item: Item = items[key]
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
                  <VStack>
                    <Button
                      onClick={() => {
                        onOpen()
                        handleCreateOrder()
                      }}
                    >
                      Solana Pay
                    </Button>
                    <Button onClick={resetState}>Reset</Button>
                  </VStack>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </HStack>

      {isOpen && (
        <QrModal
          onClose={onClose}
          value={total}
          confirmed={confirmed}
          setConfirmed={setConfirmed}
        />
      )}

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

// {result && <pre>Catalog result: {JSON.stringify(result, null, 2)}</pre>}
