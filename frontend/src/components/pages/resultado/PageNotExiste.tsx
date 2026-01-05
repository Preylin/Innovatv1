import { type FC } from 'react';
import { Result } from 'antd';

const PageNoExiste: FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="Lo siento, la página que intentas acceder no existe."
  />
);

export default PageNoExiste;