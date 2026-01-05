import { BaseAvatar, type UIAvatarProps } from "../../../ui/antd/avatar/AvatarWrapper";

interface AvatarAtomProps extends UIAvatarProps {
  size?: UIAvatarProps["size"];
}

export const AvatarAtom = (props: AvatarAtomProps) => {
  return <BaseAvatar {...props} />;
};
