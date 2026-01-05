import ButtonAtom from "../../atoms/boton/Button";
import {LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import TooltipAtom from "../../atoms/tooltip/Tooltip";

interface Props {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}


function ButtonSave(props: Props){
    return(
        <TooltipAtom content="Guardar" placement="top">
            <ButtonAtom icon={props.disabled ? <LoadingOutlined /> : <SaveOutlined />} {...props} />
        </TooltipAtom>

    )
}


export default ButtonSave;