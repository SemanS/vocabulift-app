import React, { lazy, FC } from "react";

import Dashboard from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import LayoutPage from "@/pages/layout";
import WrapperRouteComponent from "./config";
import { useRoutes, RouteObject } from "react-router-dom";
import BookDetail from "@/pages/bookDetail";
import Books from "@/pages/books";
import Vocabulary from "@/pages/vocabulary";

const NotFound = lazy(() => import("@/pages/404"));
//const Project = lazy(() => import("@/pages/project"));

const routeList: RouteObject[] = [
  {
    path: "/",
    element: (
      <WrapperRouteComponent auth={true}>
        <LayoutPage />
      </WrapperRouteComponent>
    ),
    children: [
      {
        path: "/dashboard",
        element: (
          <WrapperRouteComponent>
            <Dashboard />
          </WrapperRouteComponent>
        ),
      },
      {
        path: "/books/:title",
        element: (
          <WrapperRouteComponent>
            <BookDetail />
          </WrapperRouteComponent>
        ),
      },
      {
        path: "/books",
        element: (
          <WrapperRouteComponent>
            <Books />
          </WrapperRouteComponent>
        ),
      },
      {
        path: "/vocabulary",
        element: (
          <WrapperRouteComponent>
            <Vocabulary />
          </WrapperRouteComponent>
        ),
      },
      /* {
        path: "/project/list",
        element: (
          <WrapperRouteComponent>
            <Project />
          </WrapperRouteComponent>
        ),
      }, */
      {
        path: "*",
        element: (
          <WrapperRouteComponent>
            <NotFound />
          </WrapperRouteComponent>
        ),
      },
    ],
  },
  {
    path: "login",
    element: <LoginPage />,
  },
];

const RenderRouter: FC = () => {
  const element = useRoutes(routeList);
  return element;
};

export default RenderRouter;
