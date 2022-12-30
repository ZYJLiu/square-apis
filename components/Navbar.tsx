import {
  MenuButton,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  IconButton,
  Spacer,
} from "@chakra-ui/react"
import { HamburgerIcon } from "@chakra-ui/icons"
import Link from "next/link"
import WalletMultiButton from "./WalletMultiButton"

const Navbar = () => {
  return (
    <Flex px={4} py={4}>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<HamburgerIcon />}
          variant="outline"
        />
        <MenuList>
          <MenuItem as={Link} href="/">
            Home
          </MenuItem>
          <MenuItem as={Link} href="/oauth">
            OAuth
          </MenuItem>
          <MenuItem as={Link} href="/catalog">
            Catalog
          </MenuItem>
          <MenuItem as={Link} href="/createOrder">
            Create Order
          </MenuItem>
          <MenuItem as={Link} href="/makePayment">
            Make Payment
          </MenuItem>
        </MenuList>
      </Menu>

      <Spacer />
      <WalletMultiButton />
    </Flex>
  )
}

export default Navbar
