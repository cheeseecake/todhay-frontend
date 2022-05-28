import React, { useCallback, useEffect, useState } from "react";
import { Container, Nav, Navbar, Button, Row, Col } from "react-bootstrap";
import Select from "react-select";

import { getType } from "./api/api";

import { Lists } from "./lists/Lists";
import { Tags } from "./tags/Tags";
import { Todos } from "./todos/Todos";
import { Wishlist } from "./wishlist/Wishlist";

export const API_ROOT = "/api";

/* Enum of data types and their display values 
This allows us to reference them as DATA_TYPES.[type],
which prevents errors from typos happening further down.*/
export const DATA_TYPES = {
  TODOS: {
    displayName: "Todos",
    apiName: "todos",
  },
  LISTS: {
    displayName: "Lists",
    apiName: "lists",
  },
  WISHLIST: {
    displayName: "Wishlist",
    apiName: "wishlists",
  },
  TAGS: {
    displayName: "Tags",
    apiName: "tags",
  },
};

export const App = () => {
  const [activeDataType, setActiveDataType] = useState(
    DATA_TYPES.TODOS.apiName
  );
  const [selectedListId, setSelectedListId] = useState('');

  const [tags, setTags] = useState([]);
  const [lists, setLists] = useState([]);
  const [todos, setTodos] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const refreshTags = useCallback(
    () => void getType(DATA_TYPES.TAGS).then((json) => setTags(json)),
    []
  );

  const refreshLists = useCallback(
    () => void getType(DATA_TYPES.LISTS).then((json) => setLists(json)),
    []
  );

  const refreshTodos = useCallback(
    () => void getType(DATA_TYPES.TODOS).then((json) => setTodos(json)),
    []
  );

  const refreshWishlist = useCallback(
    () => void getType(DATA_TYPES.WISHLIST).then((json) => setWishlist(json)),
    []
  );

  useEffect(() => {
    refreshTags();
    refreshLists();
    refreshTodos();
    refreshWishlist();
  }, []);

  const viewTodosFromListId = (listId) => {
    setSelectedListId(listId);
    setActiveDataType(DATA_TYPES.TODOS.apiName);
  };

  // totalRewards and claimedRewards will be recalculated every render
  // It's not expensive, hence they're not memoized
  const totalRewards = todos
    .filter((todo) => !!todo.completed_date)
    .reduce((acc, todo) => acc + parseFloat(todo.reward), 0);

  // I'm not sure where 'purchasedate' was previously calculated/derived from,
  // couldn't find it in the Wishlist model. So I'm assuming
  // just adding the count X costs of all the wishes should be the claimedRewards
  const claimedRewards = wishlist.reduce(
    (acc, wish) => acc + parseFloat(wish.cost) * parseFloat(wish.count),
    0
  );

  const availableRewards = totalRewards - claimedRewards;

  const views = {
    [DATA_TYPES.TAGS.apiName]: (
      <Tags lists={lists} todos={todos} refreshTags={refreshTags} tags={tags} />
    ),

    [DATA_TYPES.TODOS.apiName]: (
      <Todos
        lists={lists}
        selectedTags={selectedTags}
        refreshTodos={refreshTodos}
        selectedListId={selectedListId}
        setSelectedListId={setSelectedListId}
        todos={todos}
      />
    ),

    [DATA_TYPES.LISTS.apiName]: (
      <Lists
        lists={lists}
        refreshLists={refreshLists}
        tags={tags}
        selectedTags={selectedTags}
        todos={todos}
        viewTodosFromListId={viewTodosFromListId}
      />
    ),

    [DATA_TYPES.WISHLIST.apiName]: (
      <Wishlist
        availableRewards={availableRewards}
        refreshWishlist={refreshWishlist}
        wishlist={wishlist}
        tags={tags}
      />
    ),
  };

  return (
    <div>
      <Navbar
        style={{ backgroundColor: "#2D3047" }}
        expand="sm"
        variant="dark"
      >
        <Container fluid style={{ padding: "1px 100px 1px" }}>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav variant="tabs" className="me-auto">
              <Nav.Link
                key="Todos"
                active={"todos" === activeDataType}
                style={{ color: "white", backgroundColor: "#2D3047" }}
                onClick={() => setActiveDataType("todos")}
              >
                Todos
              </Nav.Link>
              <Nav.Link
                key="Lists"
                active={"lists" === activeDataType}
                style={{ color: "white", backgroundColor: "#2D3047" }}
                onClick={() => setActiveDataType("lists")}
              >
                Lists
              </Nav.Link>
            </Nav>
            <Navbar.Text
              style={{ color: "white" }}
              className="justify-content-end"
            >
              <Button variant="outline-light" onClick={() => setActiveDataType("wishlists")}>
                Redeem wish (${availableRewards.toFixed(1)})
              </Button>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid style={{ padding: "20px 100px 20px" }}>
        {["todos", "lists"].includes(activeDataType) &&
          <Row>
            <Col >
              <Select
                name="tags"
                placeholder="All Tags"
                isMulti
                options={tags.map((tag) => ({ value: tag.id, label: tag.title }))}
                onChange={(e) => { setSelectedTags(e.map((tag) => tag.value)) }}
              />
            </Col>
            <Col md="auto">
              <Button
                variant="outline-dark"
                onClick={() => setActiveDataType("tags")}
              >
                View tags
              </Button>
            </Col>
          </Row>}


        {/* We display the appropriate view based on activeDataType*/}
        {views[activeDataType]}
      </Container >
    </div >
  );
};
