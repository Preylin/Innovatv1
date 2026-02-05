import ButtonAtom from "../../atoms/boton/Button";
import {LoadingOutlined, PlusOutlined } from '@ant-design/icons';

interface Props {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    name?: string;
}
<LoadingOutlined />


function ButtomNew({disabled, name = "Nuevo", ...props}: Props){
    return(
        <ButtonAtom icon={disabled ? <LoadingOutlined /> : <PlusOutlined />} {...props}> {name}</ButtonAtom>
    )
}


export default ButtomNew;