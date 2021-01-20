import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../actions/actions";
import { HashRouter as Router, Switch, Route, Link } from "react-router-dom";
import Metrics from "./tabs/Metrics";
import Images from "./tabs/Images";
import Yml from "./tabs/Yml";
import Containers from "./tabs/Containers";
import * as helper from "./helper/commands";
import Docketeer from "../../assets/docketeer-title.png";
import Settings from "./tabs/Settings/Settings";
import startNotificationRequester from "./helper/notificationsRequester";
import initDatabase from "./helper/initDatabase";

/**
 * Container component that has all redux logic along with react router
 */
const App = () => {
  const dispatch = useDispatch();
  const addRunningContainers = (data) =>
    dispatch(actions.addRunningContainers(data));
  const refreshRunningContainers = (data) =>
    dispatch(actions.refreshRunningContainers(data));
  const refreshStoppedContainers = (data) =>
    dispatch(actions.refreshStoppedContainers(data));
  const refreshImagesList = (data) => dispatch(actions.refreshImages(data));
  const composeymlFiles = (data) => dispatch(actions.composeymlFiles(data));
  const getNetworkContainers = (data) =>
    dispatch(actions.getNetworkContainers(data));
  const removeContainer = (id) => dispatch(actions.removeContainer(id));
  const runStoppedContainer = (data) =>
    dispatch(actions.runStoppedContainer(data));
  const stopRunningContainer = (id) =>
    dispatch(actions.stopRunningContainer(id));

  const runningList = useSelector((state) => state.containersList.runningList);
  const stoppedList = useSelector((state) => state.containersList.stoppedList);
  const imagesList = useSelector((state) => state.images.imagesList);
  const networkList = useSelector((state) => state.networkList.networkList);

  const [selected, setSelected] = useState("/");

  useEffect(() => {
    initDatabase();
    helper.refreshRunning(refreshRunningContainers);
    helper.refreshStopped(refreshStoppedContainers);
    helper.refreshImages(refreshImagesList);
    helper.writeToDb();
    helper.networkContainers(getNetworkContainers);
    helper.setDbSessionTimeZone();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      helper.refreshRunning(refreshRunningContainers);
      helper.refreshStopped(refreshStoppedContainers);
      helper.refreshImages(refreshImagesList);
    }, 5000);

    startNotificationRequester();

    return () => clearInterval(interval);
  }, []);

  const selectedStyling = {
    background: "#e1e4e6",
    color: "#042331",
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  };

  return (
    <Router>
      <div className="container">
        <nav className="tab">
          <header id="title">
            <img src={Docketeer} width={160} />
          </header>
          <div className="viewsAndButton">
            <ul>
              <li>
                <Link
                  to="/"
                  style={selected === "/" ? selectedStyling : null}
                  onClick={() => setSelected("/")}
                >
                  <i className="fas fa-settings"></i> Settings
                </Link>
              </li>
              <li>
                <Link
                  to="/running"
                  style={selected === "/running" ? selectedStyling : null}
                  onClick={() => setSelected(() => "/running")}
                >
                  <i className="fas fa-box-open"></i> Containers
                </Link>
              </li>
              <li>
                <Link
                  to="/images"
                  style={selected === "/images" ? selectedStyling : null}
                  onClick={() => setSelected("/images")}
                >
                  <i className="fas fa-database"></i> Images
                </Link>
              </li>
              <li>
                <Link
                  to="/metrics"
                  style={selected === "/metrics" ? selectedStyling : null}
                  onClick={() => setSelected("/metrics")}
                >
                  <i className="fas fa-chart-pie"></i> Metrics
                </Link>
              </li>
              <li>
                <Link
                  to="/yml"
                  style={selected === "/yml" ? selectedStyling : null}
                  onClick={() => setSelected("/yml")}
                >
                  <i className="fas fa-file-upload"></i> Docker Compose
                </Link>
              </li>
            </ul>
            <div>
              <button
                className="btn"
                onClick={(e) => helper.handlePruneClick(e)}
              >
                System Prune
              </button>
            </div>
          </div>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
                renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/metrics">
            <Metrics runningList={runningList} />
          </Route>
          <Route path="/yml">
            <Yml networkList={networkList} composeymlFiles={composeymlFiles} />
          </Route>
          <Route path="/images">
            <Images
              runIm={helper.runIm}
              removeIm={helper.removeIm}
              addRunningContainers={addRunningContainers}
              refreshImagesList={refreshImagesList}
              imagesList={imagesList}
              runningList={runningList}
            />
          </Route>
          <Route path="/running">
            <Containers
              runIm={helper.runIm}
              stop={helper.stop}
              stopRunningContainer={stopRunningContainer}
              runningList={runningList}
              addRunningContainers={addRunningContainers}
              // Stopped Containers
              runStopped={helper.runStopped}
              remove={helper.remove}
              removeContainer={removeContainer}
              runStoppedContainer={runStoppedContainer}
              stoppedList={stoppedList}
            />
          </Route>
          <Route path="/">
            <Settings runningList={runningList} stoppedList={stoppedList} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

export default App;
