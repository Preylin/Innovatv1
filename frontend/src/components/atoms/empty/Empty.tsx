import type { FC } from "react";
import { BaseEmpty, type UIEmptyProps } from "../../../ui/antd/empty/EmptyWrapper";

export type EmptyAtomProps = Omit<UIEmptyProps, "image"> & {

  image?: UIEmptyProps["image"] | string;
  description?: UIEmptyProps["description"] | React.ReactNode;
  className?: string;
};

export const EmptyAtom: FC<EmptyAtomProps> = ({
  image,
  description = "No hay datos",
  className = "",
  children,
  ...rest
}) => {
  // Si image es string lo usamos como imageUrl (Antd acepta node o url)
  const imageProp = typeof image === "string" ? { image: image } : { image: image as UIEmptyProps["image"] };

  return (
    <div className={`flex justify-center items-center p-6 ${className}`}>
      <BaseEmpty description={description} {...imageProp} {...rest}>
        {children}
      </BaseEmpty>
    </div>
  );
};

export default EmptyAtom;
