import React from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { getLogin } from "../api/api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const listSchema = yup
    .object({
        username: yup.string().required(),
        password: yup.string().required()
    })
    .required();

export const Login = ({
    refreshTags,
    refreshLists,
    refreshTodos,
    refreshWishlist,
    setUsername
}) => {

    const {
        register,
        handleSubmit,
        reset,
    } = useForm({
        resolver: yupResolver(listSchema),
    });

    const onSubmit = (credentials) =>
        getLogin(credentials)
            .then(() => {
                setUsername(true);
                refreshTags();
                refreshLists();
                refreshTodos();
                refreshWishlist();
                reset({
                    username: '',
                    password: '',
                })
            })

    return (
        <>
            <Form>
                <Row>
                    <Col>
                        <Form.Group>
                            <Form.Control
                                {...register("username")}
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Username"
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Control
                                {...register("password")}
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Password"
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Button variant="outline-light" onClick={handleSubmit(onSubmit)} >
                            Login
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>)
};
