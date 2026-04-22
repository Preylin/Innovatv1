import { ConfigProvider, theme } from "antd";
import esES from "antd/locale/es_ES";
import { type FC } from "react";

const { defaultAlgorithm, darkAlgorithm } = theme;

interface AntdProviderProps {
  children: React.ReactNode;
  dark?: boolean;
}

export const AntdProvider: FC<AntdProviderProps> = ({
  children,
  dark = false,
}) => {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: dark ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: dark ? "#394447" : "#22292b",
          borderRadius: 5,
          fontSize: 14,
          fontFamily: "Roboto, sans-serif",
          colorBgContainer: dark ? "#1A1919" : "#F7F7F7", // color de fondo de layout
          colorBorderSecondary: dark ? "#666666" : "#5C5C5C", // border secundario de elementos
          colorBorder: dark ? "#A1A1A1" : "#544848", // border primario de elementos
        },
        components: {
          Card: {
            colorBorderSecondary: dark ? "#22292b" : "#9ca8ab",
            colorBgContainer: dark ? "#161b1d" : "#e3e7e8",
          },
          Collapse: {
            colorBorder: "#9ca8ab",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};
