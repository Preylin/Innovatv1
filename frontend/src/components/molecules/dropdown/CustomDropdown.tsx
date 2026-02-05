import { Dropdown, type DropDownProps, type MenuProps } from "antd";
import type { FC } from "react";

interface CustomDropdownProps {
  items: MenuProps["items"];
  triggerElement: React.ReactNode;
  dropdownProps?: Omit<DropDownProps, "menu">;
  placement?: DropDownProps["placement"];
  pointAtCenter?: boolean;
}

const CustomDropdown: FC<CustomDropdownProps> = ({
  items,
  triggerElement,
  dropdownProps,
  placement = "bottom",
  pointAtCenter = false,
}) => (
  <Dropdown
    arrow={pointAtCenter ? { pointAtCenter } : false}
    placement={placement}
    menu={{ items }}
    trigger={["click"]}
    {...dropdownProps}
  >
    <div className="inline-block cursor-pointer">{triggerElement}</div>
  </Dropdown>
);

export default CustomDropdown;
