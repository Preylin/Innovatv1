import { ConfigProvider, theme } from "antd";
import esES from "antd/locale/es_ES";
import { type FC } from "react";

const { defaultAlgorithm, darkAlgorithm } = theme;

interface AntdProviderProps {
  children: React.ReactNode;
  dark?: boolean;
}

export const AntdProvider: FC<AntdProviderProps> = ({ children, dark = false}) => {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        algorithm: dark ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: "#00695C",
          borderRadius: 4,
          fontSize: 14,
          fontFamily: "Roboto, sans-serif",
          colorBgContainer: dark ? "#1A1919" : "#F7F7F7", // color de fondo de layout
          colorBorderSecondary: dark ? "#666666" : "#5C5C5C", // border secundario de elementos
          colorBorder: dark ? "#A1A1A1" : "#544848", // border primario de elementos
        },
        components: {
          Card: {
            colorBorderSecondary: dark ? "#393939" : "#B0B0B0",
            colorBgContainer: dark ? "#2B2B2B" : "#FCFCFC",
          },
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
};

