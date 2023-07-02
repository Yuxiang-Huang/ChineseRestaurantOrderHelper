import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { useNavigate } from "react-router-dom";
import nextId from "react-id-generator";
import AddOrderPage from "./components/AddOrderPage";
import OrderListPage from "./components/OrderListPage";
import { OrderItem } from "./hooks/useFoodMenu";
import "./index.css";
import { produce } from "immer";

export interface Order {
  id: string;
  customerDescription: string;
  orderItemList: OrderItem[];
  archived: boolean;
}

const App = () => {
  //#region Initialization and Synchronization
  const navigate = useNavigate();
  const storage = window.sessionStorage;

  const [orderList, setOrderList] = useState<Order[]>([]);
  const [archivedOrderList, setArchivedOrderList] = useState<Order[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);

  // order, order list, and archived order list  from session storage
  useEffect(() => {
    let rawValue = storage.getItem("order list");
    if (rawValue) setOrderList(JSON.parse(rawValue));
    rawValue = storage.getItem("order");
    if (rawValue) setOrder(JSON.parse(rawValue));
    rawValue = storage.getItem("archived order list");
    if (rawValue) setArchivedOrderList(JSON.parse(rawValue));
  }, []);

  // sync order list wth session storage
  useEffect(() => {
    storage.setItem("order list", JSON.stringify(orderList));
  }, [orderList]);

  // sync order wth session storage
  useEffect(() => {
    storage.setItem("order", JSON.stringify(order));
  }, [order]);

  // sync archived order list wth session storage
  useEffect(() => {
    storage.setItem("archived order list", JSON.stringify(archivedOrderList));
  }, [archivedOrderList]);

  //#endregion

  //#region Order List
  const addToOrderList = (orderItemList: OrderItem[]) => {
    setOrderList([
      ...orderList,
      {
        id: nextId(),
        customerDescription: "Customer Name",
        orderItemList: orderItemList,
        archived: false,
      },
    ]);
    //clear order and go to order list page
    setOrder([]);
    storage.setItem("order", "[]");
    navigate("/OrderList");
  };
  //#endregion

  //#region Four buttons for each order
  const updateCustomerDescription = (id: string, newDescription: string) => {
    setOrderList(
      produce((draft) => {
        const orderToChange = draft.find((orderItem) => orderItem.id === id);
        if (orderToChange) orderToChange.customerDescription = newDescription;
      })
    );
  };

  const edit = (orderToEdit: Order) => {
    // navigate to add order page
    navigate("/");
    // delete this order from order list
    setOrderList(orderList.filter((order) => order.id !== orderToEdit.id));
    // set order to this order
    setOrder(orderToEdit.orderItemList);
  };

  const archive = (orderToEdit: Order) => {
    // delete this order from order list
    setOrderList(orderList.filter((order) => order.id !== orderToEdit.id));
    // add this archived order to archived order list
    setArchivedOrderList([
      ...archivedOrderList,
      { ...orderToEdit, archived: true },
    ]);
  };

  //#endregion

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AddOrderPage
            storage={storage}
            order={order}
            setOrder={setOrder}
            addToOrderList={addToOrderList}
          />
        }
      />
      <Route
        path="/OrderList"
        element={
          <OrderListPage
            orderList={orderList}
            archivedOrderList={archivedOrderList}
            updateCustomerDescription={updateCustomerDescription}
            edit={edit}
            archive={archive}
          />
        }
      />
    </Routes>
  );
};

// calculate the total price of an order
export const calculateTotalPrice = (order: OrderItem[]) => {
  let total = 0;
  order.map((OrderItem) => (total += OrderItem.price));
  return total;
};

export default App;
