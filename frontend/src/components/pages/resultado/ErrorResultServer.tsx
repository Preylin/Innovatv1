import { type FC } from 'react';
import { Result } from 'antd';

const ErrorResultServer: FC = () => (
  <Result
    status="500"
    title="500"
    subTitle="Lo siento, algo salió mal."
  />
);

export default ErrorResultServer;