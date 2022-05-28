import { format, parseISO } from "date-fns";
import React, { useState } from "react";
import { Button, Row, Col, Form, Modal } from "react-bootstrap";
import { updateType, createType, deleteType } from "../api/api";
import { DATA_TYPES } from "../App";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const todoSchema = yup.object({
  title: yup.string().required(),
  description: yup.string(),
  list: yup.string(),
  effort: yup.number(),
  reward: yup.number(),
  frequency: yup.string()
    .nullable()
    .transform(v => (v === "" ? null : v)),
  end_date: yup.string()
    .nullable()
    .transform(v => (v === "" ? null : v)),
  current_streak: yup.number(),
  max_streak: yup.number(),
  start_date: yup
    .string()
    .nullable()
    .when("completed_date", {
      // Require start_date if there is a completed_date
      is: (v) => !!v,
      then: yup
        .string()
        .nullable()
        .required("Start date is required if completed date is specified"),
    })
    .transform((v) => v || null),
  due_date: yup
    .string()
    .nullable()
    .transform((v) => v || null),
  completed_date: yup
    .string()
    .nullable()
    .transform((v) => v || null)
    .test(
      "invalid_date",
      "Completed date must not be before start date",
      (v, ctx) =>
        !v ||
        parseISO(v) >= parseISO(ctx.parent.start_date)
    )
}).required();

export const TodosModal = ({ lists, refreshTodos, setTodo, todo }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(todoSchema),
    defaultValues: {
      title: todo?.title,
      description: todo?.description,
      list: todo?.list,
      effort: todo?.effort || 0.5,
      reward: todo?.reward || 0.5,
      frequency: todo?.frequency,
      end_date: todo?.end_date,
      current_streak: todo?.current_streak || 0,
      max_streak: todo?.max_streak || 0,
      start_date: todo ? todo.start_date : format(new Date(), "yyyy-MM-dd"),
      due_date: todo?.due_date,
      completed_date: todo?.completed_date,
    }
  });

  const [effort, setEffort] = useState(todo?.effort || 0.5);

  const onSubmit = (data) => {
    const id = todo?.id;

    const operation = id
      ? updateType({ id, ...data }, DATA_TYPES.TODOS) // Existing todo
      : createType(data, DATA_TYPES.TODOS); // New todo

    operation
      .then(() => {
        refreshTodos();
        setTodo(null);
      })
      .catch(alert);
  };

  const onDelete = () =>
    window.confirm(`Delete '${todo.title}?'`) &&
    deleteType(todo, DATA_TYPES.TODOS).then(() => {
      refreshTodos();
      setTodo(null);
    });

  return (
    <Modal show onHide={() => setTodo(null)} size="lg" backdrop="static">
      <Modal.Header closeButton>
        /{DATA_TYPES.TODOS.apiName}/{todo?.id || "<New Todo>"}
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={8}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  {...register("title")}
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>List</Form.Label>
                <Form.Select
                  {...register("list")}
                  name="list"
                  defaultValue={todo?.list}
                >
                  {lists.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </Form.Select >
              </Form.Group>
            </Col>
          </Row>

          <Row >
            <Col md={6}>
              <Form.Group>
                <Form.Label>Effort (hrs) - {effort * 60} minutes</Form.Label>
                <Form.Control
                  {...register("effort")}
                  type="integer"
                  name="effort"
                  onChange={(e) => setEffort(e.target.value)}
                />
                <p className="error">{errors.effort?.message}</p>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Reward ($) - recommended ${effort}</Form.Label>
                <Form.Control
                  {...register("reward")}
                  type="integer"
                  name="reward"
                />
                <p className="error">{errors.reward?.message}</p>
              </Form.Group>
            </Col>
          </Row>

          <Row >
            <Col md={3}>
              <Form.Group>
                <Form.Label>Frequency</Form.Label>
                <Form.Select
                  {...register("frequency")}
                  name="frequency"
                >
                  <option value={""}>One-time</option>
                  <option value={"DAILY"}>Daily</option>
                  <option value={"WEEKLY"}>Weekly</option>
                  <option value={"MONTHLY"}>Monthly</option>
                  <option value={"QUATERLY"}>Quarterly</option>
                  <option value={"YEARLY"}>Yearly</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  {...register("end_date")}
                  type="date"
                  name="end_date"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Current Streak</Form.Label>
                <Form.Control
                  {...register("current_streak")}
                  type="number"
                  name="current_streak"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Max Streak</Form.Label>
                <Form.Control
                  {...register("max_streak")}
                  type="number"
                  name="max_streak"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                {...register("description")}
                style={{ height: "150px" }}
                as="textarea"
                id="description"
                name="description"
                placeholder="Description"
              />
            </Form.Group>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  {...register("start_date")}
                  type="date"
                  id="start_date"
                  name="start_date"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  {...register("due_date")}
                  type="date"
                  id="due_date"
                  name="due_date"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Completed Date</Form.Label>
                <Form.Control
                  {...register("completed_date")}
                  type="date"
                  id="completed_date"
                  name="completed_date"
                /><p className="error">
                  {errors.completed_date?.message}</p>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="me-auto" onClick={onDelete}>
          Delete
        </Button>
        <Button variant="success" onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
