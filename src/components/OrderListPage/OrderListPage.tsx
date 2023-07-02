import {
  Button,
  List,
  ListItem,
  HStack,
  Box,
  Text,
  Switch,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import { Order } from "../../App";
import OrderTopBar from "./OrderTopBar";
import { useState } from "react";

interface Props {
  orderList: Order[];
  archivedOrderList: Order[];
  updateCustomerDescription: (id: string, newDescription: string) => void;
  pay: (id: string) => void;
  edit: (order: Order) => void;
  archive: (order: Order) => void;
  unarchive: (order: Order) => void;
}

const OrderListPage = ({
  orderList,
  archivedOrderList,
  updateCustomerDescription,
  pay,
  edit,
  archive,
  unarchive,
}: Props) => {
  const [archivedMode, setArchivedMode] = useState(false);

  return (
    <>
      <HStack justifyContent={"space-between"}>
        <Link to="/">
          <Button colorScheme="red" margin={3}>
            <AiOutlinePlus />
          </Button>
        </Link>
        <HStack>
          <Switch
            colorScheme="green"
            isChecked={archivedMode}
            onChange={(event) => setArchivedMode(event.target.checked)}
          />
          <Text whiteSpace="nowrap" marginRight={3}>
            Show Archive
          </Text>
        </HStack>
      </HStack>

      <List spacing={3} margin={3}>
        {orderList.map((order) => (
          <Box border={"2px"} marginBottom={10} key={order.id}>
            <OrderTopBar
              order={order}
              updateCustomerDescription={updateCustomerDescription}
              pay={pay}
              edit={edit}
              archive={archive}
              unarchive={unarchive}
            />
            {order.orderItemList.map((orderItem) => (
              <ListItem key={orderItem.id}>
                <HStack justifyContent={"space-between"}>
                  <HStack>
                    <Box margin={3}>{orderItem.name}</Box>
                    <Text fontSize="xs">{orderItem.customization}</Text>
                  </HStack>
                  <HStack>
                    <Box margin={3}>{"$" + orderItem.price}</Box>
                  </HStack>
                </HStack>
              </ListItem>
            ))}
          </Box>
        ))}
      </List>

      {archivedMode && (
        <List spacing={3} margin={3}>
          {archivedOrderList.map((order) => (
            <Box
              border={"2px"}
              marginBottom={10}
              key={order.id}
              background={"gray"}
            >
              <OrderTopBar
                order={order}
                pay={pay}
                updateCustomerDescription={updateCustomerDescription}
                edit={edit}
                archive={archive}
                unarchive={unarchive}
              />
              {order.orderItemList.map((orderItem) => (
                <ListItem key={orderItem.id}>
                  <HStack justifyContent={"space-between"}>
                    <HStack>
                      <Box margin={3}>{orderItem.name}</Box>
                      <Text fontSize="xs">{orderItem.customization}</Text>
                    </HStack>
                    <HStack>
                      <Box margin={3}>{"$" + orderItem.price}</Box>
                    </HStack>
                  </HStack>
                </ListItem>
              ))}
            </Box>
          ))}
        </List>
      )}
    </>
  );
};

export default OrderListPage;