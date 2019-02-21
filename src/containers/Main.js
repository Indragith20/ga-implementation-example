// import Loadable from 'react-loadable';
// import React from 'react';
// // import Spinner from 'react-spinkit';

// const Loading = () => <h1>Loading</h1>;

// export const Home = Loadable({
//     loader: () => import(/*webpackChunkName: 'Home' */'./Home'),
//     loading: Loading
// });

// export const About = Loadable({
//     loader: () => import(/*webpackChunkName: 'About' */'./About'),
//     loading: Loading
// });

// export const Contacts = Loadable({
//     loader: () => import(/*webpackChunkName: 'Contacts' */'./Contacts'),
//     loading: Loading
// })

import * as React from 'react';
import * as Loadable from 'react-loadable';

const loading = ({ isLoading, error }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>Sorry, there was a problem loading the page.</div>;
  } else {
    return null;
  }
};

export const AsyncComponent = (loader) => Loadable({ loader, loading });
