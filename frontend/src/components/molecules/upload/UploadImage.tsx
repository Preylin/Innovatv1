import { App, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import type { FC } from 'react';


type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface FormUploadImageProps {
  field: any;
  maxFiles?: number;
  maxSizeMB?: number; // Nueva prop
  allowedTypes?: string[]; // Nueva prop (ej: ['image/jpeg', 'image/png'])
}

const FormUploadImage: FC<FormUploadImageProps> = ({ 
  field, 
  maxFiles = 1, 
  maxSizeMB = 20, // Por defecto 20MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const { message } = App.useApp();

  const fileList: UploadFile[] = (field.state.value || []).map((img: any, index: number) => ({
    uid: index.toString(),
    name: `image-${index}`,
    status: 'done',
    url: img.image_byte, // El base64 sirve como URL para la vista previa
  }));

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const beforeUpload = (file: FileType) => {
    const isAllowedType = allowedTypes.includes(file.type);
    if (!isAllowedType) {
      message.error(`Solo puedes subir archivos: ${allowedTypes.join(', ')}`);
      return Upload.LIST_IGNORE; // Ignora el archivo
    }

    const isLtMB = file.size / 1024 / 1024 < maxSizeMB;
    if (!isLtMB) {
      message.error(`La imagen debe pesar menos de ${maxSizeMB}MB`);
      return Upload.LIST_IGNORE;
    }

    return false; // Retorna false para manejar la subida manualmente
  };

  const onChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    // Procesamos cada archivo para convertirlo a Base64 si es nuevo
    const processedList = await Promise.all(
      newFileList.map(async (file) => {
        if (file.originFileObj) {
          const base64 = await getBase64(file.originFileObj as FileType);
          return { image_byte: base64 };
        }
        return { image_byte: file.url || "" };
      })
    );
    
    // Enviamos al formulario el formato exacto: [{ image_byte: "data:..." }]
    field.handleChange(processedList);
  };

    const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as FileType);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  return (
    <ImgCrop rotationSlider aspect={1}>
      <Upload
        listType="picture-card"
        onPreview={onPreview}
        fileList={fileList}
        beforeUpload={beforeUpload} // Validación aquí
        onChange={onChange}
        accept={allowedTypes.join(',')} // Filtra archivos en el selector del sistema
        style={{fontSize: '12px'}}
      >
        {fileList.length < maxFiles && '+ Subir imagen'}
      </Upload>
    </ImgCrop>
  );
};

export default FormUploadImage;