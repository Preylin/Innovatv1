import ButtonAtom from "../../atoms/boton/Button";
import {DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import TooltipAtom from "../../atoms/tooltip/Tooltip";

interface Props {
    children?: React.ReactNode;
    onClick?: () => void;
    loading?: boolean;
    style?: React.CSSProperties;
}
<LoadingOutlined />


function ButtonDelete(props: Props){
    return(
        <TooltipAtom content="Eliminar" placement="top">
            <ButtonAtom color="danger" icon={ props.loading ? <LoadingOutlined /> : <DeleteOutlined />} {...props} />
        </TooltipAtom>

    )
}


export default ButtonDelete;