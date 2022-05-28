import { useState } from "react";
import React from "react";
import { Button, Card, Row, Col } from "react-bootstrap";
import { TagsModal } from "./TagsModal";

export const Tags = ({ refreshTags, tags, lists, todos }) => {
  const [editingTag, setEditingTag] = useState();

  // Sort tags by topic, title
  tags = tags.sort(
    (a, b) =>
      a.topic - b.topic ||
      a.title - b.title
  );

  const cards = tags.map((tag) => {
    const listsWithTag = lists.filter((list) => list.tags.includes(tag.id));
    const numLists = listsWithTag.length;
    const numPendingTodos = todos.filter((todo) =>
      !todo.completed_date && listsWithTag.map((list) => list.id).includes(todo.list)
    ).length;

    return (
      <Col key={tag.id}>
        <Card
          onClick={() => setEditingTag(tag)}
          bg={tag.topic ? "secondary" : "light"}
          text={tag.topic ? "light" : "dark"}
          style={{ cursor: "pointer" }}
        >
          <Card.Body>
            <Card.Title tag="h5">{tag.title}</Card.Title>
            <Card.Text>
              {numLists} list{numLists !== 1 && 's'} ({numPendingTodos} todo{numPendingTodos !== 1 && 's'})
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    );
  });

  return (
    <>
      <Button onClick={() => setEditingTag({})}>
        Add tag
      </Button>
      <div style={{ padding: "20px" }}>
        {editingTag && (
          <TagsModal
            tag={editingTag}
            setTag={setEditingTag}
            refreshTags={refreshTags}
          />
        )}
        <Row xs={2} md={3} lg={5} className="g-3">
          {cards}
        </Row>
      </div>
    </>
  );
};
