import { Alert, Avatar, Tooltip } from "antd";
import { useUsuariosListOnline } from "../../api/queries/auth/usuarios";
import getBase64WithPrefix from "../../helpers/ImagesBase64";
import { defaultImage } from "../../assets/images";

function UsuariosOnline() {
  const {
    data: usuariosOnline,
    isLoading,
    isError,
    error,
  } = useUsuariosListOnline();
  
  if (isLoading) return <div />;
  if (isError) return <Alert type="error" title={error.message} showIcon />;

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 p-2 mr-4 ">
      {Array.isArray(usuariosOnline) &&
        usuariosOnline.map((usuario) => (
          <Tooltip key={usuario.id} title={usuario.name}>
            <Avatar
              src={
                usuario.image_base64
                  ? getBase64WithPrefix(usuario.image_base64)
                  : defaultImage
              }
              size={28}
            />
          </Tooltip>
        ))}
    </div>
  );
}

export default UsuariosOnline;
