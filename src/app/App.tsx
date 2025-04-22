import { RouterProvider } from 'react-router';
import router from './router';
import { FC } from 'react';

const App: FC = () => {
    return <RouterProvider router={router} />;
};

export default App;
