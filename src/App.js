import React, { useCallback, useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

import { getType, getCSRF } from "./api/api";

import { Login } from "./login/Login";
import { Logout } from "./login/Logout";
import { Lists } from "./lists/Lists";
import { Tags } from "./tags/Tags";
import { Todos } from "./todos/Todos";
import { Wishlist } from "./wishlist/Wishlist";

export const API_ROOT = "https://api.fisheecake.com";


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
  const [username, setUsername] = useState(false);

  const [activeDataType, setActiveDataType] = useState(
    DATA_TYPES.TODOS.apiName
  );
  const [selectedListId, setSelectedListId] = useState('');

  const [tags, setTags] = useState([]);
  const [lists, setLists] = useState([]);
  const [todos, setTodos] = useState([]);
  const [wishlist, setWishlist] = useState([]);

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
    getCSRF();
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

  const allRewards = todos
    .reduce((acc, todo) => acc + parseFloat(todo.reward), 0);

  const views = {
    [DATA_TYPES.TAGS.apiName]: (
      <Tags lists={lists} todos={todos} refreshTags={refreshTags} tags={tags} />
    ),

    [DATA_TYPES.TODOS.apiName]: (
      <Todos
        lists={lists}
        tags={tags}
        refreshTodos={refreshTodos}
        selectedListId={selectedListId}
        setSelectedListId={setSelectedListId}
        todos={todos}
        totalRewards={totalRewards}
        allRewards={allRewards}
      />
    ),

    [DATA_TYPES.LISTS.apiName]: (
      <Lists
        lists={lists}
        refreshLists={refreshLists}
        tags={tags}
        todos={todos}
        viewTodosFromListId={viewTodosFromListId}
      />
    ),

    [DATA_TYPES.WISHLIST.apiName]: (
      <Wishlist
        totalRewards={totalRewards}
        refreshWishlist={refreshWishlist}
        wishlist={wishlist}
        tags={tags}
      />
    ),
  };

  return (
    <div>
      <Navbar
        bg="dark"
        expand="sm"
        variant="dark"
      >
        <Container>
          <Navbar.Brand key="Todos"
            style={{ cursor: "pointer" }}
            active={"todos" === activeDataType}
            onClick={() => setActiveDataType("todos")}
          >
            Todos</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav variant="tabs" className="me-auto">
              <Nav.Link
                key="Lists"
                onClick={() => setActiveDataType("lists")}
              >
                Lists
              </Nav.Link>
              <Nav.Link
                key="wishlist"
                onClick={() => setActiveDataType("wishlists")}
              >
                Wishlist
              </Nav.Link>
              <Nav.Link
                key="Tags"
                onClick={() => setActiveDataType("tags")}
              >
                Tags
              </Nav.Link>
            </Nav>
            <Navbar.Text
              style={{ color: "white" }}
              className="justify-content-end"
            >{!username ?
              <Login
                refreshWishlist={refreshWishlist}
                refreshLists={refreshLists}
                refreshTodos={refreshTodos}
                refreshTags={refreshTags}
                setUsername={setUsername}
              />

              :
              <Logout
                setWishlist={setWishlist}
                setLists={setLists}
                setTodos={setTodos}
                setTags={setTags}
                setUsername={setUsername}
              />
              }
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        {/* We display the appropriate view based on activeDataType*/}
        {views[activeDataType]}
      </Container >
    </div >
  );
};
