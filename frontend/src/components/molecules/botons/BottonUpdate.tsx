import ButtonAtom from "../../atoms/boton/Button";
import {LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import TooltipAtom from "../../atoms/tooltip/Tooltip";

interface Props {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}


function ButtonUpdate(props: Props){
    return(
        <TooltipAtom content="Actualizar" placement="top">
            <ButtonAtom color='cyan' icon={props.disabled ? <LoadingOutlined /> : <ReloadOutlined />} {...props} />
        </TooltipAtom>

    )
}


export default ButtonUpdate;