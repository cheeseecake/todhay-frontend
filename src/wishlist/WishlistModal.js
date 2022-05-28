import React from "react";
import { Button, Form, Modal, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { createType, deleteType, updateType } from "../api/api";
import { DATA_TYPES } from "../App";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const wishlistSchema = yup.object({
  title: yup.string().required(),
  tags: yup.array().transform((v) => v.map((t) => t.value)),
  cost: yup.number(),
  repeat: yup.boolean(),
  count: yup.number(),
  last_purchased_date: yup.string()
    .nullable()
    .transform(v => (v === "" ? null : v)),
  img_url: yup.string().url(),
  product_url: yup.string().url()
}).required();

export const WishlistModal = ({ refreshWishlist, setWish, wish, tags }) => {
  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(wishlistSchema),
    defaultValues: {
      title: wish?.title,
      tags: tags
        .filter((tag) => wish.tags?.includes(tag.id))
        .map((tag) => ({ value: tag.id, label: tag.title })),
      cost: wish?.cost || 10,
      repeat: wish?.repeat,
      count: wish?.count || 0,
      last_purchased_date: wish?.last_purchased_date,
      img_url: wish?.img_url,
      product_url: wish?.product_url
    }
  });

  const onSubmit = (data) => {
    const id = wish?.id;


    const operation = id
      ? updateType({ id, ...data }, DATA_TYPES.WISHLIST) // Existing wish
      : createType(data, DATA_TYPES.WISHLIST); // New wish

    operation
      .then(() => {
        refreshWishlist();
        setWish(null);
      })
      .catch(alert);
  };

  const onDelete = () =>
    window.confirm(`Delete '${wish.title}?'`) &&
    deleteType(wish, DATA_TYPES.WISHLIST).then(() => {
      refreshWishlist();
      setWish(null);
    });

  return (
    <Modal show onHide={() => setWish(null)} size="lg" backdrop="static">
      <Modal.Header closeButton>
        /{DATA_TYPES.WISHLIST.apiName}/{wish?.id || "<New Wish>"}
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
                  render={({ field }) => <Select
                    {...field}
                    placeholder="Tags"
                    closeMenuOnSelect={false}
                    isMulti
                    options={tags
                      .map((tag) => ({ value: tag.id, label: tag.title }))}
                  />}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Cost ($)</Form.Label>
                <Form.Control
                  {...register("cost")}
                  type="number"
                  id="cost"
                  name="cost"
                />
                <p className="error">{errors.cost?.message}</p>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Repeat?</Form.Label>
                <Form.Select
                  {...register("repeat")}
                  name="repeat"
                >
                  <option value={false}>false</option>
                  <option value={true}>true</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Count</Form.Label>
                <Form.Control
                  {...register("count")}
                  type="number"
                  id="count"
                  name="count"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Last Purchased Date</Form.Label>
                <Form.Control
                  {...register("last_purchased_date")}
                  type="date"
                  name="last_purchased_date"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group>
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              {...register("img_url")}
              type="text"
              name="img_url"
            />
            <p className="error">{errors.img_url?.message}</p>
          </Form.Group>

          <Form.Group>
            <Form.Label>Product URL</Form.Label>
            <Form.Control
              {...register("product_url")}
              type="text"
              name="product_url"
            />
            <p className="error">{errors.product_url?.message}</p>
          </Form.Group>

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
    </Modal >
  );
};
