import React, { FC, useEffect, useState } from "react";
import { Navigate, RouteProps, useLocation, useNavigate } from "react-router";
import { useRecoilState } from "recoil";
import { userState } from "@/stores/user";
import { useCookies } from "react-cookie";
import axios from "axios";
import { getGlobalState } from "../models";
import { Spin } from "antd";
import { SubscriptionPeriod, SubscriptionType, User } from "@/models/user";

const PrivateRoute: FC<RouteProps> = ({ children }) => {
  const [user, setUser] = useRecoilState(userState);
  const [cookies] = useCookies(["access_token"]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.MODE === "staging") {
      sessionStorage.setItem("access_token", "641880e55febd60caa927162");
      const devUser: User = {
        ...getGlobalState(),
        username: "Slavo",
        isLogged: true,
        menuList: [
          {
            path: "/library",
            name: "library",
            label: {
              zh_CN: "图书",
              en_US: "library",
            },
            icon: "book",
            key: "library",
          },
          {
            path: "/vocabulary",
            name: "vocabulary",
            label: {
              zh_CN: "词汇",
              en_US: "Vocabulary",
            },
            icon: "vocabulary",
            key: "vocabulary",
          },
        ],
        locale: "en-US",
        library: [],
        role: "guest",
        newUser: false,
        avatar: "",
        sourceLanguage: "en",
        targetLanguage: "sk",
        languageForMeaning: "en",
        isLimitExceeded: false,
        isAddVideoExceeded: false,
        subscribed: false,
        activated: true,
        verified: true,
        exceededAt: new Date(2023, 5, 2),
        userLibraries: [
          {
            libraryId: "6478fdc0d220b2b50883b874",
            timeStamp: 10,
          },
        ],
        picture:
          "https://lh3.googleusercontent.com/ogw/AOLn63G44ZepIWVlalbQumSaDkFtQfP2w3PHBvGPjSg1=s32-c-mo",
        subscriptionType: SubscriptionType.Linguist,
        subscriptionPeriod: SubscriptionPeriod.Monthly,
        email: "slavosmn@gmail.com",
        subscriptionId: "",
      };
      setUser(devUser);
      setLoading(false);
    } else if (cookies.access_token && !user.isLogged) {
      async () => {
        try {
          sessionStorage.setItem("access_token", cookies.access_token);

          const response = await axios.get(
            `${import.meta.env.VITE_REACT_APP_SERVER_ENDPOINT}/user/current`,
            {
              headers: {
                Authorization: `Bearer ${cookies.access_token}`,
              },
            }
          );

          setUser({
            ...getGlobalState(),
            username: "Slavo",
            noticeCount: 0,
            isLogged: true,
            ...response.data.body,
          });

          if (response.data.status === "not-activated") {
            navigate("/verification");
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <Spin size="large" />;
  }

  return user.isLogged ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;
