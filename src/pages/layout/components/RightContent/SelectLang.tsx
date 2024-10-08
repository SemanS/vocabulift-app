import React from "react";
import { Button, Dropdown, Menu } from "antd";
import { ReactComponent as LanguageSvg } from "@/assets/header/language.svg";
import classes from "./index.module.less";
import { localeConfig } from "@/config/locale";
import { useLocale } from "@/locales";
import { useRecoilState } from "recoil";
import { userState } from "@/stores/user";
import { updateUser } from "@/services/userService";
import { DownOutlined } from "@ant-design/icons";
import { parseLocale } from "@/utils/stringUtils";

const SelectLang = ({ setDropdownActive, uniqueLanguages }) => {
  const [user, setUser] = useRecoilState(userState);

  const defaultLanguageOptions = [
    "en",
    "es",
    "sk",
    "de",
    "fr",
    "cs",
    "pl",
    "hu",
    "it",
    "zh",
    "uk",
  ];

  const shouldUseUniqueLanguages = window.location.pathname === "/library";

  const usedLanguages = shouldUseUniqueLanguages
    ? defaultLanguageOptions
    : uniqueLanguages;

  const selectLocale = async ({ key }) => {
    await updateUser({ locale: key });
    setUser((prev) => ({
      ...prev,
      locale: key,
      targetLanguage: parseLocale(key),
    }));
    localStorage.setItem("locale", key);
    setDropdownActive(false);

    const newQueryParams = new URLSearchParams(window.location.search);
    newQueryParams.set("targetLanguage", parseLocale(key));
    window.history.pushState(null, "", "?" + newQueryParams.toString());
  };

  const items = localeConfig
    .filter((lang) => usedLanguages.includes(parseLocale(lang.key)))
    .map((lang) => ({
      key: lang.key,
      disabled: user.targetLanguage === parseLocale(lang.key),
      label: (
        <>
          {lang.icon}
          <span style={{ marginLeft: "10px" }}>{lang.name}</span>
        </>
      ),
      onClick: () => selectLocale({ key: lang.key }),
    }));

  const currentLangIcon = localeConfig.find(
    (lang) => parseLocale(lang.key) === user.targetLanguage
  );

  return (
    <div>
      <Dropdown
        onVisibleChange={setDropdownActive}
        overlay={<Menu items={items} />}
        trigger={["click"]}
        arrow={true}
        placement="bottom"
        overlayStyle={{
          boxShadow: "0 2px 10px DimGrey",
          border: "1px solid #ccc",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <Button
          size="large"
          className={classes.actionButton}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 5px DimGrey",
            border: "none",
          }}
        >
          <DownOutlined />
          <span>Native language: </span>
          <span
            style={{
              marginLeft: "4px",
              marginRight: "6px",
              fontWeight: "bold",
            }}
          >
            {currentLangIcon?.name}
          </span>
          {currentLangIcon?.icon}
        </Button>
      </Dropdown>
    </div>
  );
};

export default SelectLang;
