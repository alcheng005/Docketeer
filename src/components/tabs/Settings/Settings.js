import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import * as actions from "../../../actions/actions";
import * as categories from "../../../constants/notificationCategories";
import query from "../../helper/psqlquery";
import * as queryType from "../../../constants/queryTypes";
import { makeStyles } from "@material-ui/core/styles";
import ContainerSettingsTable from "./ContainerSettingsTable";
import PhoneInput from "./PhoneInput";
import IntervalInput from "./IntervalInput";

const useStyles = makeStyles(() => ({
  root: {
    "& .MuiTextField-root": {
      marginLeft: 5,
      marginBottom: 15,
      width: 220,
      verticalAlign: "middle",
    },
  },
  button: {
    marginLeft: 5,
    width: 100,
    verticalAlign: "top",
    size: "medium",
  },
  verifiedIcon: {
    verticalAlign: "top",
    color: "green",
  },
  description: {
    marginLeft: 5,
    marginBottom: 15,
  },
}));

const Settings = (props) => {
  let allContainersList = props.runningList.concat(props.stoppedList);

  return (
    <div className="renderContainers">
      <div className="header">
        <h1 className="tabTitle">Settings</h1>
      </div>

      <div className="metric-section-title">
        <h3>Phone Registration</h3>
      </div>
      <div className="settings-container">
        <PhoneInput styles={useStyles} />
      </div>

      <div className="metric-section-title">
        <h3>Monitoring & Notification Frequency</h3>
      </div>
      <div className="settings-container">
        <IntervalInput styles={useStyles} />
      </div>

      <div className="metric-section-title">
        <h3>Container Settings Table </h3>
      </div>
      <div className="settings-container">
        <ContainerSettingsTable
          containers={allContainersList}
          styles={useStyles}
        />
      </div>

      <br></br>
    </div>
  );
};

export default Settings;
