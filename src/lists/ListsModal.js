import { format, parseISO } from "date-fns";
import React from "react";
import Select from "react-select";
import { Button, Row, Col, Form, Modal } from "react-bootstrap";
import { createType, deleteType, updateType } from "../api/api";
import { DATA_TYPES } from "../App";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const listSchema = yup
  .object({
    title: yup.string().required(),
    tags: yup.array().transform((v) => v.map((t) => t.value)),
    description: yup.string(),
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
  })
  .required();

export const ListsModal = ({ list, setList, tags, refreshLists }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(listSchema),
    defaultValues: {
      title: list?.title,
      tags: tags
        .filter((tag) => list.tags?.includes(tag.id))
        .map((tag) => ({ value: tag.id, label: tag.title })),
      description: list?.description,

      // If a created list didn't have a start_date, show nothing, else if
      // it's a new list (i.e. list is null) then show today's data by default
      start_date: list ? list.start_date : format(new Date(), "yyyy-MM-dd"),

      due_date: list?.due_date,
      completed_date: list?.completed_date,
    },
  });

  const onDelete = () =>
    window.confirm(`Delete '${list.title}?'`) &&
    deleteType(list, DATA_TYPES.LISTS).then(() => {
      refreshLists();
      setList(null);
    });

  const onSubmit = (data) => {
    const id = list?.id;

    const operation = id
      ? updateType({ id, ...data }, DATA_TYPES.LISTS) // Existing list
      : createType(data, DATA_TYPES.LISTS); // New list

    operation
      .then(() => {
        refreshLists();
        setList(null);
      })
      .catch(alert);
  };

  return (
    <Modal show onHide={() => setList(null)} size="lg" backdrop="static">
      <Modal.Header closeButton>
        /{DATA_TYPES.LISTS.apiName}/{list.id || "<New List>"}
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
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
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tags</Form.Label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      placeholder="Tags"
                      closeMenuOnSelect={false}
                      isMulti
                      options={tags.map((tag) => ({
                        value: tag.id,
                        label: tag.title,
                      }))}
                    />
                  )}
                />
                <p className="error">{errors.tags?.message}</p>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              {...register("description")}
              as="textarea"
              id="description"
              name="description"
              placeholder="Description"
            />
          </Form.Group>
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
                <p className="error">{errors.start_date?.message}</p>
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
                />
                <p className="error">{errors.completed_date?.message}</p>
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
