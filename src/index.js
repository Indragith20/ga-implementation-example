import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import MainContainer from './containers/MainContainer';

const App = () => (
    <BrowserRouter>
        <MainContainer />
    </BrowserRouter>
)

ReactDOM.render(<App />, document.getElementById('react'));
