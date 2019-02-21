import React from 'react';
import { Route, Link, Switch, Redirect } from "react-router-dom";
import { AsyncComponent, AsyncTicketList } from './Main';
import { withRouter } from 'react-router-dom';
import CustomMatch from './CustomMatch';
import { AsyncTicketLeftMenu } from './AsyncTicket';

class MainContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPath: location.pathname
        }
    }

    listenForHistoryChange() {
        const history = this.props.history;
        history.listen((location, action) => {
            console.log(action, location.pathname, location.state);
            const previousUrl = this.state.currentPath;
            this.setState(() => ({
                currentPath: location.pathname
            }));
            const nextUrl = location.pathname;
            console.log(previousUrl, nextUrl);
            this.postAnalyticsData({previousPath: previousUrl, nextPath: nextUrl});
        });
    }

    postAnalyticsData(payload) {
        fetch("http://localhost:9000/saveData",
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(function(res){ return res.json(); })
            .then(function(data){ console.log(data) })
    }

    componentDidMount() {
        this.listenForHistoryChange();
    }

    render() {
        return (
            <div>
                <CustomMatch>
                    <AsyncTicketLeftMenu />
                </CustomMatch>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <a className="navbar-brand" href="#">Navbar</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active">
                                <Link to="/" className="nav-link">Home <span className="sr-only">(current)</span></Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/about" className="nav-link" href="#">About</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/contacts" className="nav-link" href="#">Contacts</Link>
                            </li>
                            <li className="nav-item active">
                                <Link to="/task" className="nav-link">Tasks <span className="sr-only">(current)</span></Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/team" className="nav-link" href="#">Team</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/class" className="nav-link" href="#">Class</Link>
                            </li>
                        </ul>
                    </div>
                </nav>
                <Switch>
                    <Route path="/class" component={AsyncComponent(() => import(/*webpackChunkName: 'Class' */'./Class'))} />
                    <Route path="/team" component={AsyncComponent(() => import(/*webpackChunkName: 'Teams' */'./Teams'))} />
                    <Route path="/task" exact component={AsyncComponent(() => import(/*webpackChunkName: 'Task' */'./Tasks'))} />
                    <Route path="/about" component={AsyncComponent(() => import(/*webpackChunkName: 'About' */'./About'))} />
                    <Route path="/contacts" component={AsyncComponent(() => import(/*webpackChunkName: 'Contacts' */'./Contacts'))} />
                    <Route path="/" exact component={AsyncComponent(() => import(/*webpackChunkName: 'Home' */'./Home'))} />
                </Switch>
            </div>
        );
    }
}
export default withRouter(MainContainer);