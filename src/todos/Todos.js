import { parseISO, format } from "date-fns";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { ProgressBar, Badge, Button, Nav, Table, Row, Col, OverlayTrigger, Tooltip, Pagination } from "react-bootstrap";
import { patchType } from "../api/api";
import { DATA_TYPES } from "../App";
import { formatDays } from "../shared/util";
import { TodosModal } from "./TodosModal";

export const Todos = ({
  lists,
  tags,
  refreshTodos,
  selectedListId,
  setSelectedListId,
  todos,
  totalRewards,
  allRewards
}) => {
  const [editingTodo, setEditingTodo] = useState();
  const [selectedTags, setSelectedTags] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('Doing');
  const [currentPage, setCurrentPage] = useState(0);

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
  if (filteredStatus == "Done") {
    filteredTodos = filteredTodos.filter(
      // completed
      (todo) => todo.completed_date
    );
  }
  if (filteredStatus == "Doing") {
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
  if (filteredStatus == "Starting") {
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
  if (filteredStatus == "Planning") {
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

  const pageSize = 50;
  let pageCount = Math.ceil(filteredTodos.length / pageSize);
  if (currentPage > pageCount) {
    setCurrentPage(0);
  }
  const setPage = (e, index) =>
    setCurrentPage(index);

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
      <ProgressBar >
        <ProgressBar
          variant="success"
          now={100 * (1 - totalRewards / allRewards) + 1}
          label={`$${(allRewards - totalRewards).toFixed(1)} to earn`} />
        <ProgressBar
          style={{ backgroundColor: "#064b35" }}
          now={100 * (totalRewards / allRewards)}
          label={`$${totalRewards.toFixed(1)} earned`}
          key={2} />
      </ProgressBar>
      <Row className="m-4 ">
        <Col >
          <Select
            name="tags"
            placeholder="All Tags"
            isMulti
            options={tags.map((tag) => ({ value: tag.id, label: tag.title }))}
            onChange={(e) => { setSelectedTags(e.map((tag) => tag.value)) }}
          />
        </Col>
        <Col>
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
      <Nav fill variant="tabs">
        <Nav.Item>
          <Nav.Link
            className={filteredStatus == "Planning" ? "active" : ""}
            onClick={() => setFilteredStatus('Planning')}
          >
            Planning
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            className={filteredStatus == "Starting" ? "active" : ""}
            onClick={() => setFilteredStatus('Starting')}
          >
            Starting
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            className={filteredStatus == "Doing" ? "active" : ""}
            onClick={() => setFilteredStatus('Doing')}
          >
            Doing
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            className={filteredStatus == "Done" ? "active" : ""}
            onClick={() => setFilteredStatus('Done')}
          >
            Done
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <Table hover responsive="md">
        <thead>
          <tr>
            <th>Tasks ({filteredTodos.length})</th>
            <th>Start on</th>
            <th>Due on</th>
            {filteredStatus == "Done"
              ? <th>Done on</th>
              : <th style={{
                textAlign: "right"
              }}>To</th>
            }
          </tr>
        </thead>
        <tbody>
          {filteredTodos.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize
          ).map((todo) => {
            const formattedStartDate = todo.start_date
              ? formatDays(todo.start_date)
              : "";
            const formattedDueDate = todo.due_date
              ? formatDays(todo.due_date)
              : "";
            const isOverdue = new Date() > parseISO(todo.due_date);
            return (
              <tr
                key={todo.id}
                style={{
                  backgroundColor: todo.frequency && "#212529",
                }}>
                <td
                  onClick={() => setEditingTodo(todo)}
                  style={{
                    cursor: "pointer",
                  }}
                >
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
                    <Badge bg="dark" text="light">
                      {todo.frequency}{" "}
                      <span
                        className="streak">
                        {todo.current_streak}/{todo.max_streak}
                      </span>
                    </Badge>
                  }
                </td>
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
                    <b style={{ fontSize: "80%", color: isOverdue ? "#d15c38" : "white" }}>
                      {formattedDueDate}
                    </b>
                  }
                </td>
                <td style={{
                  textAlign: "right"
                }}>
                  {todo.completed_date
                    ? format(parseISO(todo.completed_date), "d MMM yy")
                    : (todo.start_date && parseISO(todo.start_date) < new Date())
                      ? <Button
                        variant="success"
                        onClick={() => completeTodo(todo)}
                      >
                        Done
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
      <Pagination>
        <Pagination.First />
        <Pagination.Prev />
        {[...Array(pageCount)].map((page, i) =>
          <Pagination.Item active={i === currentPage} key={i} onClick={e => setPage(e, i)}>
            {i + 1}
          </Pagination.Item>
        )}
        <Pagination.Next />
        <Pagination.Last />
      </Pagination>
    </>
  );
};
