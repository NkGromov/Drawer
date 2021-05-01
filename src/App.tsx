import React, { FC } from 'react';
import { Route, Switch } from "react-router-dom";
import Draw from './Components/Draw/Draw';

const App: FC = () => {
    return (
        <>
        <Switch>
            <Route exact path="/" component={Draw} />
        </Switch>
         </>
    );
};

export default App;