import ButtonAtom from "../../atoms/boton/Button";
import {LoadingOutlined, PlusOutlined } from '@ant-design/icons';

interface Props {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}
<LoadingOutlined />


function ButtomNew(props: Props){
    return(
        <ButtonAtom icon={props.disabled ? <LoadingOutlined /> : <PlusOutlined />} {...props}> Nuevo</ButtonAtom>
    )
}


export default ButtomNew;