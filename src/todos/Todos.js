import { formatDuration, intervalToDuration, parseISO, format } from "date-fns";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Navbar, Container, Badge, Button, Nav, Table, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { patchType } from "../api/api";
import { DATA_TYPES } from "../App";
import { formatDays } from "../shared/util";
import { TodosModal } from "./TodosModal";

export const Todos = ({
  selectedTags,
  lists,
  refreshTodos,
  selectedListId,
  setSelectedListId,
  todos,
}) => {
  const [editingTodo, setEditingTodo] = useState();

  const [filteredStatus, setfilteredStatus] = useState('In Progress');

  /* Always refetch todos when this view is first mounted */
  useEffect(() => refreshTodos(), [refreshTodos]);

  const completeTodo = (todo) =>
    new Date().getDate() >= new Date(todo.start_date).getDate()
      ? patchType(
        { ...todo, completed_date: format(new Date(), "yyyy-MM-dd") },
        DATA_TYPES.TODOS
      ).then(refreshTodos)
      : window.alert(`Completed date cannot be before start date. Please edit start/completed date.`);

  const startTodo = (todo) =>
    patchType(
      { ...todo, start_date: format(new Date(), "yyyy-MM-dd") },
      DATA_TYPES.TODOS
    ).then(refreshTodos);

  // Filter list selection by tag if a tag was selected from autocomplete field,
  // or if no tag was selected, show everything
  let filteredLists =
    selectedTags.length > 0
      ? lists.filter((list) =>
        list.tags.some((tag) => selectedTags.includes(tag))
      )
      : lists;

  // Filter todos based on selected list 
  // or if no selected list, show all todos in the pre-filtered lists
  let filteredTodos = selectedListId
    ? todos.filter((todo) => todo.list === selectedListId)
    : todos.filter((todo) => filteredLists.map((list) => list.id).includes(todo.list)
    );

  // Further filter todos depending based on selected status tab of todos
  if (filteredStatus == "Completed") {
    filteredTodos = filteredTodos.filter(
      // completed
      (todo) => todo.completed_date
    );
  }
  else if (filteredStatus == "In Progress") {
    filteredTodos = filteredTodos.filter(
      (todo) => (
        // not completed AND
        !todo.completed_date && (
          // started OR
          (todo.start_date && parseISO(todo.start_date) <= new Date()) ||
          // not started but due
          (!todo.start_date && todo.due_date && parseISO(todo.due_date) <= new Date())
        )
      ));
  }
  else if (filteredStatus == "Pending") {
    filteredTodos = filteredTodos.filter(
      (todo) => (
        // not completed AND
        !todo.completed_date &&
        // not started AND
        (todo.due_date && (!todo.start_date || parseISO(todo.start_date)) > new Date()) &&
        // not due
        (todo.start_date && (!todo.due_date || parseISO(todo.due_date) > new Date()))
      ));
  }
  // To plan i.e. no start date or due date
  else if (filteredStatus == "Backlog") {
    filteredTodos = filteredTodos.filter(
      // completed
      (todo) => (!todo.completed_date && !todo.start_date && !todo.due_date)
    );
  }

  // Sort todos based on descending completed_date, ascending due_date and start_date
  filteredTodos = filteredTodos.sort(
    (a, b) =>
      new Date(b.completed_date) - new Date(a.completed_date) ||
      new Date(a.due_date) - new Date(b.due_date) ||
      new Date(a.start_date) - new Date(b.start_date)
  );

  return (
    <>
      {editingTodo && (
        <TodosModal
          lists={lists}
          refreshTodos={refreshTodos}
          setTodo={setEditingTodo}
          todo={editingTodo}
        />
      )}
      <Navbar>
        <Container >
          <Row className="p-2 me-auto">
            <Col style={{ "width": "400px" }}>
              <Select
                name="lists"
                placeholder="All Lists"
                isClearable
                options={
                  filteredLists
                    .map((list) => ({
                      value: list.id,
                      label: list.title
                    }))
                }
                defaultValue={{
                  value: selectedListId,
                  label: lists.find((list) => list.id === selectedListId)
                    ? lists.find((list) => list.id === selectedListId).title
                    : 'All Lists'
                }}
                onChange={(list) => setSelectedListId(list ? list.value : '')}
              />
            </Col>
            <Col>
              <Button
                color="info"
                onClick={() => setEditingTodo({ list: selectedListId })}
              >
                Add todo
              </Button>
            </Col>
          </Row>
          <Nav variant="tabs" className="justify-content-end">
            <Nav.Item>
              <Nav.Link
                className={filteredStatus == "Backlog" ? "active" : ""}
                onClick={() => setfilteredStatus('Backlog')}
              >
                Backlog
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                className={filteredStatus == "Pending" ? "active" : ""}
                onClick={() => setfilteredStatus('Pending')}
              >
                Pending
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                className={filteredStatus == "In Progress" ? "active" : ""}
                onClick={() => setfilteredStatus('In Progress')}
              >
                In Progress
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                className={filteredStatus == "Completed" ? "active" : ""}
                onClick={() => setfilteredStatus('Completed')}
              >
                Completed
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Container>
      </Navbar >
      <Table bordered hover responsive="md" >
        <thead style={{ backgroundColor: "#2D3047", color: "white" }}>
          <tr>
            <th>Title ({filteredTodos.length})</th>
            <th>
              Effort (
              {filteredTodos
                .reduce((acc, todo) => acc + parseFloat(todo.effort), 0)
                .toFixed(1)}{" "}
              hrs)
            </th>
            <th>
              Rewards ($
              {filteredTodos
                .reduce((acc, todo) => acc + parseFloat(todo.reward), 0)
                .toFixed(1)}
              )
            </th>
            <th>Start Date</th>
            <th>Due Date</th>
            {filteredStatus == "Completed"
              ? <th>Completed date</th>
              : <th>Action</th>
            }
          </tr>
        </thead>
        <tbody>
          {filteredTodos.map((todo) => {
            // https://stackoverflow.com/questions/62590455/format-time-interval-in-seconds-as-x-hours-y-minutes-z-seconds
            const formattedEffortHours = formatDuration(
              intervalToDuration({ start: 0, end: todo.effort * 3600_000 })
            );
            const formattedStartDate = todo.start_date
              ? formatDays(todo.start_date)
              : "";
            const formattedDueDate = todo.due_date
              ? formatDays(todo.due_date)
              : "";
            const isOverdue = new Date() > parseISO(todo.due_date);
            return (
              <tr key={todo.id}>
                <td onClick={() => setEditingTodo(todo)}>
                  <OverlayTrigger
                    placement='right-start'
                    overlay={
                      <Tooltip
                        id={todo.id}
                        className="tooltip"
                      >
                        {todo.description.slice(0, 500)}...
                      </Tooltip>
                    }
                  ><span>
                      {todo.title}{" "}
                    </span>
                  </OverlayTrigger>
                  <br />
                  <span
                    className="subtitle">
                    {lists.find((list) => list.id === todo.list)?.title}{" "}
                  </span>
                  {!todo.completed_date && todo.frequency &&
                    <Badge bg="light" text="dark">
                      {todo.frequency}{" "}
                      <span
                        className="streak">
                        Streak: {todo.current_streak}/{todo.max_streak}
                      </span>
                    </Badge>
                  }
                </td>
                <td>{formattedEffortHours}</td>
                <td>${todo.reward}</td>
                <td>
                  {todo.start_date
                    ? format(parseISO(todo.start_date), "d MMM yy")
                    : "None"}{" "}
                  <br />
                  {!todo.completed_date &&
                    <b style={{ fontSize: "80%" }}>
                      {formattedStartDate}
                    </b>
                  }
                </td>
                <td>
                  {todo.due_date
                    ? format(parseISO(todo.due_date), "d MMM yy")
                    : "None"}{" "}
                  <br />
                  {!todo.completed_date &&
                    <b style={{ fontSize: "80%", color: isOverdue ? "#D33F49" : "black" }}>
                      {formattedDueDate}
                    </b>
                  }
                </td>
                <td>
                  {todo.completed_date
                    ? format(parseISO(todo.completed_date), "d MMM yy")
                    : (todo.start_date && parseISO(todo.start_date) < new Date())
                      ? <Button
                        variant="success"
                        onClick={() => completeTodo(todo)}
                      >
                        Complete
                      </Button>
                      : <Button
                        variant="success"
                        onClick={() => startTodo(todo)}
                      >
                        Start
                      </Button>
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
};
