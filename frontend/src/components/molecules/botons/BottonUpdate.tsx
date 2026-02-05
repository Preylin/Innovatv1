import ButtonAtom from "../../atoms/boton/Button";
import {EditOutlined, LoadingOutlined } from '@ant-design/icons';
import TooltipAtom from "../../atoms/tooltip/Tooltip";

interface Props {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    style?: React.CSSProperties;
}


function ButtonUpdate(props: Props){
    return(
        <TooltipAtom content="Actualizar" placement="top">
            <ButtonAtom color='cyan' icon={props.disabled ? <LoadingOutlined /> : <EditOutlined />} {...props} />
        </TooltipAtom>

    )
}


export default ButtonUpdate;