
import { Avatar as AntdAvatar } from "antd";
import type { AvatarProps } from "antd";

export interface UIAvatarProps extends AvatarProps {}

export const BaseAvatar = (props: UIAvatarProps) => {
    return <AntdAvatar {...props} />;
};