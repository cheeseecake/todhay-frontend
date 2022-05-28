import { format } from "date-fns";
import React, { useState } from "react";
import { Button, Card, Row, Col, ProgressBar, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { updateType } from "../api/api";
import { DATA_TYPES } from "../App";
import { formatDays } from "../shared/util";
import { WishlistModal } from "./WishlistModal";

export const Wishlist = ({ availableRewards, refreshWishlist, wishlist, tags }) => {
  const [editingWish, setEditingWish] = useState();

  const redeemWish = (wish) =>
    updateType({
      ...wish,
      count: wish.count + 1,
      last_purchased_date: format(new Date(), "yyyy-MM-dd")
    },
      DATA_TYPES.WISHLIST)
      .then(refreshWishlist)
      .catch(alert);

  // Sort wishlist by topic, title
  wishlist = wishlist.sort(
    (a, b) =>
      b.repeat - a.repeat ||
      new Date(a.last_purchased_date) - new Date(b.last_purchased_date) ||
      a.cost - b.cost
  );
  const cards = wishlist.map((wish) => {
    /* A wish is reedeemable if the count is 0, OR it's a repeatable wish
    (a repeatable wish is always redeemable, the count just increases) */
    let isWishRedeemable = wish.count === 0 || wish.repeat;

    return (
      <Col key={wish.id}>
        <Card
          onClick={() => setEditingWish(wish)}
          style={{
            cursor: "pointer",
          }}
        >
          {wish.img_url && (
            <Card.Img
              width="100%"
              src={wish?.img_url}
              alt="img"
              onClick={(e) => {
                e.stopPropagation();
                if (wish?.product_url) {
                  window.open(wish?.product_url, "_blank", "noopener,noreferrer");
                } else {
                  alert("No Product URL specified");
                }
              }}
            />
          )}

          <Card.Body>
            <Card.Title tag="h5">
              {wish.title} x{wish?.count}
            </Card.Title>
            <Card.Subtitle className="subtitle">
              {wish.last_purchased_date
                && `Purchased ${formatDays(wish.last_purchased_date)}`
              }
            </Card.Subtitle>
            <Card.Text>
              {wish.tags.map(id => (
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
            {isWishRedeemable &&
              (wish.cost <= availableRewards
                ? (<Button
                  variant="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    redeemWish(wish);
                  }}
                >
                  Redeem
                </Button>)
                :
                <OverlayTrigger
                  placement='bottom'
                  overlay={
                    <Tooltip id={wish.id}>
                      Earn ${(parseFloat(wish.cost) - availableRewards).toFixed(1)} more to redeem.
                    </Tooltip>
                  }
                >
                  <ProgressBar variant="success" now={100 * (availableRewards / wish.cost)} />
                </OverlayTrigger>
              )}
            {" "}${wish.cost}
          </Card.Footer>
        </Card>
      </Col >
    );
  });

  return (
    <>
      <Button color="info" onClick={() => setEditingWish({})}>
        Add wish
      </Button>
      <div style={{ padding: "20px" }}>
        {editingWish && (
          <WishlistModal
            wish={editingWish}
            setWish={setEditingWish}
            refreshWishlist={refreshWishlist}
            tags={tags}
          />
        )}
        <Row xs={1} md={3} lg={5} className="g-3">
          {cards}
        </Row>
      </div>
    </>
  );
};
