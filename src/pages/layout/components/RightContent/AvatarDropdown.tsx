import React, { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { LogoutOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Spin } from "antd";

import classes from "./index.module.less";
import { useRecoilState } from "recoil";
import { userState } from "@/stores/user";
import { useCookies } from "react-cookie";
import { useIntl } from "react-intl";

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const [user, setUser] = useRecoilState(userState);
  const [cookies, setCookie] = useCookies(["access_token"]);
  const intl = useIntl();
  const { username, avatar } = user;

  const navigate = useNavigate();
  const location = useLocation();

  const loginOut = async () => {
    if (cookies.access_token) {
      if (import.meta.env.MODE === "testing") {
        setCookie("access_token", "", { expires: new Date(0) });
      } else if (
        import.meta.env.MODE === "development" ||
        import.meta.env.MODE === "production"
      ) {
        setCookie("access_token", "", {
          expires: new Date(0),
          secure: true,
          path: "/",
          domain: "vocabulift.com",
          sameSite: "none",
        });
      }
    }
    sessionStorage.clear();
    if (location.pathname !== "/login") {
      navigate("/login", {
        replace: true,
      });
    }
  };

  const onMenuClick = useCallback(
    (event: { key: any }) => {
      const { key } = event;
      if (key === "logout" && user) {
        setUser({ ...user, isLogged: false });
        loginOut();
        return;
      }
      navigate(`/account/${key}`);
    },
    [user, setUser]
  );

  const loading = (
    <span className={`account`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!user) {
    return loading;
  }

  if (!username) {
    return loading;
  }

  const items = [
    {
      key: "logout",
      label: (
        <>
          <LogoutOutlined />{" "}
          {intl.formatMessage({
            id: "menu.sign.out",
          })}
        </>
      ),
    },
  ];

  return (
    <Dropdown
      placement="bottomRight"
      className={`${classes.action} ${classes.account}`}
      menu={{ items, onClick: onMenuClick }}
      trigger={["click"]}
    >
      <span>
        {user.picture && (
          <Avatar
            size="default"
            className={classes.avatar}
            src={user.picture}
            alt="avatar"
          />
        )}
        <span className={`${classes.name} anticon`}>{user.email}</span>
      </span>
    </Dropdown>
  );
};

export default AvatarDropdown;
