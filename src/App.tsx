import { useEffect, useState, createContext } from "react";
import { Routes, Route } from "react-router";
import { useNavigate } from "react-router-dom";
import nextId from "react-id-generator";
import AddOrderPage from "./components/AddOrderPage/AddOrderPage";
import OrderListPage from "./components/OrderListPage/OrderListPage";
import useFoodMenu, { OrderItem } from "./hooks/useFoodMenu";
import "./index.css";
import { produce } from "immer";
import MenuPage from "./components/MenuPage/MenuPage";

export interface Order {
  id: string;
  customerDescription: string;
  orderItemList: OrderItem[];
  paid: boolean;
  archived: boolean;
}

export const FunctionsContext = createContext({
  updateCustomerDescription: (id: string, newDescription: string) => {},
  pay: (id: string) => {},
  edit: (orderToEdit: Order) => {},
  archive: (orderToArchive: Order) => {},
  unarchive: (orderToArchive: Order) => {},
});
//  pay: (id: string) => void; edit: (orderToEdit: Order) => void; archive: (orderToArchive: Order) => void; unarchive: (orderToArchive: Order) => void; }' is not assignable to type '() => void'.);

const App = () => {
  //#region Initialization and Synchronization
  const navigate = useNavigate();
  const storage = window.sessionStorage;

  const [orderList, setOrderList] = useState<Order[]>([]);
  const [archivedOrderList, setArchivedOrderList] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order>({
    id: nextId(),
    customerDescription: "Customer Name",
    orderItemList: [],
    paid: false,
    archived: false,
  });

  const [fullFoodList, setFullFoodList] = useState<string[]>([]);
  const [priceDict, setPriceDict] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // full food list and price dictionary from useFoodMenu (optimized to be called once)
    const foodMenu = useFoodMenu();
    setFullFoodList(foodMenu.foodList);
    setPriceDict(foodMenu.priceDict);

    // order, order list, and archived order list  from session storage
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
  const addToOrderList = (order: Order) => {
    setOrderList([order, ...orderList]);
    // clear order and go to order list page
    setOrder({
      id: nextId(),
      customerDescription: "Customer Name",
      orderItemList: [],
      paid: false,
      archived: false,
    });
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

  const pay = (id: string) => {
    setOrderList(
      produce((draft) => {
        const orderToChange = draft.find((orderItem) => orderItem.id === id);
        if (orderToChange) orderToChange.paid = !orderToChange.paid;
      })
    );
  };

  const edit = (orderToEdit: Order) => {
    // navigate to add order page
    navigate("/");
    // delete this order from order list
    setOrderList(orderList.filter((order) => order.id !== orderToEdit.id));
    // set order to this order
    setOrder(orderToEdit);
  };

  const archive = (orderToArchive: Order) => {
    // delete this order from order list
    setOrderList(orderList.filter((order) => order.id !== orderToArchive.id));
    // add this archived order to archived order list
    setArchivedOrderList([
      { ...orderToArchive, archived: true },
      ...archivedOrderList,
    ]);
  };

  const unarchive = (orderToArchive: Order) => {
    // delete this order from archived order list
    setArchivedOrderList(
      archivedOrderList.filter((order) => order.id !== orderToArchive.id)
    );
    // add this unarchived order to order list
    setOrderList([...orderList, { ...orderToArchive, archived: false }]);
  };

  const functionsNeeded = {
    updateCustomerDescription,
    pay,
    edit,
    archive,
    unarchive,
  };

  //#endregion

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AddOrderPage
            order={order}
            fullFoodList={fullFoodList}
            priceDict={priceDict}
            setOrder={setOrder}
            addToOrderList={addToOrderList}
          />
        }
      />
      <Route
        path="/OrderList"
        element={
          <FunctionsContext.Provider value={functionsNeeded}>
            <OrderListPage
              orderList={orderList}
              archivedOrderList={archivedOrderList}
            />
          </FunctionsContext.Provider>
        }
      />
      <Route path="/Menu" element={<MenuPage priceDict={priceDict} />} />
    </Routes>
  );
};

// calculate the total price of an order
export const calculateTotalPrice = (order: OrderItem[]) => {
  let total = 0;
  order.map((OrderItem) => (total += OrderItem.price));
  return Number(total).toFixed(2);
};

export default App;
