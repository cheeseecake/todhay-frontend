import { format, parseISO } from "date-fns";
import React, { useState } from "react";
import { FcTodoList, FcClock, FcMoneyTransfer } from "react-icons/fc";
import { Navbar, Container, Badge, Button, Card, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { formatDays } from "../shared/util";
import { ListsModal } from "./ListsModal";

export const Lists = ({
  lists,
  refreshLists,
  selectedTags,
  tags,
  todos,
  viewTodosFromListId,
}) => {
  const [editingList, setEditingList] = useState();

  // Filter list selection by tag if a tag was selected from autocomplete field,
  // or if no tag was selected, filter list based on whether the list is a project (has a due date) or not
  let filteredLists =
    selectedTags.length > 0
      ? lists.filter((list) =>
        list.tags.some((tag) => selectedTags.includes(tag))
      )
      : lists;

  // Sort list by due date
  filteredLists = filteredLists.sort(
    (a, b) =>
      new Date(a.due_date) - new Date(b.due_date)
  );

  const cards = filteredLists.map((list) => {
    // Only count completed todos in calculating effort and earnings
    const completedTodosInList = todos.filter(
      (todo) => todo.list === list.id && !!todo.completed_date
    );
    const totalEffort = completedTodosInList.reduce(
      (acc, todo) => acc + parseFloat(todo.effort),
      0
    );
    const totalRewards = completedTodosInList.reduce(
      (acc, todo) => acc + parseFloat(todo.reward),
      0
    );

    const totalPendingTodos = todos.filter(
      todo => !todo.completed_date && todo.list === list.id).length
    const totalPendingRewards = todos.filter(
      todo => !todo.completed_date && todo.list === list.id).reduce(
        (acc, todo) => acc + parseFloat(todo.reward),
        0
      );

    return (

      <Col key={list.id}>
        <Card
          key={list.id}
          style={{
            backgroundColor:
              list.due_date ? "#E0EBF5" :
                list.completed_date ? "#EFFAF5" : "#E4EFF1",
          }}
        >
          <Card.Body
            style={{ cursor: "pointer" }}
            onClick={() => setEditingList(list)}
          >
            <Card.Title tag="h5">{list.title}</Card.Title>
            <Card.Subtitle className="subtitle">
              {list.due_date
                && `Due ${formatDays(list.due_date)} (${format(
                  parseISO(list.due_date),
                  "d MMM yy"
                )})`
              }
            </Card.Subtitle>
            <Card.Text>
              <FcTodoList /> {completedTodosInList.length} todos{" "}
              <FcMoneyTransfer /> ${totalRewards.toFixed(1)}{" "}
              <FcClock /> {totalEffort.toFixed(1)} hrs
            </Card.Text>
            <Card.Text>
              {list.tags.map(id => (
                <Badge pill key={id}
                  bg={tags.find(tag => tag.id === id).topic ? "secondary" : "light"}
                  text={tags.find(tag => tag.id === id).topic ? "light" : "dark"}
                  style={{ margin: '5px 5px 5px 0' }}>
                  {tags.find(tag => tag.id === id).title}
                </Badge>
              ))}
            </Card.Text>
          </Card.Body>
          <Card.Footer>
            <OverlayTrigger
              placement='right'
              overlay={
                <Tooltip id={list.id}>
                  ${totalPendingRewards} to be earned.
                </Tooltip>
              }
            >
              <Button
                variant="outline-dark"
                onClick={(e) => {
                  e.stopPropagation();
                  viewTodosFromListId(list.id);
                }}
              >
                View todos ({totalPendingTodos})
              </Button>
            </OverlayTrigger>
          </Card.Footer>
        </Card>
      </Col>
    );
  });

  return (
    <>
      <Navbar>
        <Container >
          <Row className="p-2 me-auto" >
            <Col>
              <Button color="info" onClick={() => setEditingList({})} >
                Add list
              </Button>
            </Col>
          </Row>
        </Container>
      </Navbar>
      {editingList && (
        <ListsModal
          list={editingList}
          setList={setEditingList}
          tags={tags}
          refreshLists={refreshLists}
        />
      )}
      <Row xs={1} md={3} lg={4} className="g-3">
        {cards}
      </Row>
    </>
  );
};
