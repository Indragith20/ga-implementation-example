import React from 'react';
export const AsyncTicketLeftMenu = asyncComponent(() =>
  getTicketLeftMenu().then(res => res.TicketLeftMenu)
);

export function asyncComponent(getComponent) {
  return class AsyncComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        Component: null,
        isError: false
      };
      this.ele = null;
      this.getRef = this.getRef.bind(this);
    }

    componentDidMount() {
      this.mount = true;
      let { Component } = this.state;
      if (!Component) {
        let p = getComponent();
        p.then(Component => {
          //hoistStatics(AsyncComponent, Component);
          if (this.mount) {
            this.setState({ Component, isError: false });
          }
        }).catch(() => {
          this.setState({ isError: true });
        });
      }
    }

    componentDidCatch() {
      this.setState({ isError: true });
    }

    componentWillUnmount() {
      this.mount = null;
    }

    getRef(ele) {
      this.ele = ele;
    }

    getInstance() {
      return this.ele;
    }

    render() {
      const { Component, isError } = this.state;
      if (isError) {
        return <div>Error!!!</div>;
      } else if (Component) {
        return <Component {...this.props} ref={this.getRef} />;
      }
      return null;
    }
  };
}

function getTicketLeftMenu() {
  return new Promise(res => {
    import(/*webpackChunkName: 'Ticket' */'./Ticket').then((module) => {
      const TicketLeftMenu = module.default;
      res({TicketLeftMenu})
    })
  });
}