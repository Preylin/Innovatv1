import { type FC } from 'react';
import { Collapse, type CollapseProps } from 'antd';

const CustomCollapse: FC<CollapseProps> = ({ items, ...rest }) => {
  return (
    <Collapse 
      items={items} 
      {...rest} 
    />
  );
};

export default CustomCollapse;