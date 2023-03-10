import React, { useState, useEffect } from "react";
import { List, Card, Avatar, Progress } from "antd";
import { useNavigate } from "react-router-dom";

interface Book {
  name: string;
  title: string;
  author: string;
  cover: string;
}

const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const navigate = useNavigate();

  const data = [
    {
      href: "/books/book1",
      title: `The Adventures of Huckleberry Finn`,
      description:
        "Ant Design, a design language for background applications, is refined by Ant UED Team.",
      content:
        "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.",
    },
    {
      href: "/books/book1",
      title: `The Adventures of Huckleberry Finn`,
      description:
        "Ant Design, a design language for background applications, is refined by Ant UED Team.",
      content:
        "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.",
    },
  ];

  return (
    <List
      itemLayout="vertical"
      dataSource={data}
      renderItem={(item) => (
        <List.Item
          key={item.title}
          extra={
            <img
              width={272}
              alt="logo"
              src={
                new URL(
                  "@/assets/books/The_Adventures_of_Huckleberry_Finn.png",
                  import.meta.url
                ).href
              }
            />
          }
        >
          <List.Item.Meta
            title={<a href={item.href}>{item.title}</a>}
            description={item.description}
          />
          {item.content}
          <Progress
            style={{ marginTop: "10px" }}
            percent={20}
            strokeColor={{ "0%": "#000", "100%": "#000" }}
          />
        </List.Item>
      )}
    />
  );
};

export default Books;
