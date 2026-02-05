import ButtonAtom from "../../atoms/boton/Button";
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import TooltipAtom from "../../atoms/tooltip/Tooltip";

interface Props {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}


function ButtonWatch(props: Props){
    return(
        <TooltipAtom content="Ver" placement="top">
            <ButtonAtom  color="gold" icon={props.disabled ? <EyeInvisibleOutlined /> : <EyeOutlined/>} {...props}/>
        </TooltipAtom>

    )
}


export default ButtonWatch;