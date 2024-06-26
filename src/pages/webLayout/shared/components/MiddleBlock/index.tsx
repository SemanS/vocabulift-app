import { Row, Col } from "antd";
import React from "react";
import { Slide } from "react-awesome-reveal";
import { Button } from "../../common/Button";
import { MiddleBlockSection, Content, ContentWrapper } from "./styles";

interface MiddleBlockProps {
  title: React.ReactNode;
  content: React.ReactNode;
  button?: string;
  direction?: SlideDirection;
}

export const MiddleBlock = ({
  title,
  content,
  button,
  direction,
}: MiddleBlockProps) => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id) as HTMLDivElement;
    element.scrollIntoView({
      behavior: "smooth",
    });
  };

  const contentToRender = (
    <Row justify="center" align="middle">
      <ContentWrapper>
        <Col lg={24} md={24} sm={24} xs={24}>
          <span className="custom-heading">{title}</span>
          <Content>{content}</Content>
          {button && (
            <Button name="submit" onClick={() => scrollTo("mission")}>
              {button}
            </Button>
          )}
          {/* {button && (
            <a
              href="https://www.producthunt.com/posts/vocabulift?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-vocabulift"
              target="_blank"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=406479&theme=light"
                alt="Vocabulift - Vocabulift&#0058;&#0032;Learn&#0032;Languages&#0032;via&#0032;AI&#0045;Enhanced&#0032;Videos | Product Hunt"
                width="250"
                height="54"
              />
            </a>
          )} */}
        </Col>
      </ContentWrapper>
    </Row>
  );

  return (
    <MiddleBlockSection>
      {direction ? (
        <Slide direction={direction} duration={1000} triggerOnce>
          {contentToRender}
        </Slide>
      ) : (
        contentToRender
      )}
    </MiddleBlockSection>
  );
};

export default MiddleBlock;

export type SlideDirection = "down" | "left" | "right" | "up";
