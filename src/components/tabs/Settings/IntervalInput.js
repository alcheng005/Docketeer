import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import * as actions from "../../../actions/actions";
import query from "../../helper/psqlquery";
import * as queryType from "../../../constants/queryTypes";

const IntervalInput = ({ styles }) => {
  const monitoringFrequency = useSelector(
    (state) => state.notificationList.monitoringFrequency
  );
  const notificationFrequency = useSelector(
    (state) => state.notificationList.notificationFrequency
  );

  const dispatch = useDispatch();
  const addNotificationFrequency = (data) =>
    dispatch(actions.addNotificationFrequency(data));
  const addMonitoringFrequency = (data) =>
    dispatch(actions.addMonitoringFrequency(data));

  const classes = styles();

  const saveNotificationFrequency = () => {
    // alert if input is not a number
    if (isNaN(Number(notificationFrequency)))
      alert("Please enter notification frequency in numerical format. ex: 15");
    else {
      query(
        queryType.INSERT_NOTIFICATION_FREQUENCY,
        ["admin", notificationFrequency],
        (err, res) => {
          if (err) {
            console.log(`INSERT_NOTIFICATION_FREQUENCY. Error: ${err}`);
          } else {
            console.log(`*** Inserted ${res} into users table. ***`);
            addNotificationFrequency(notificationFrequency);
          }
        }
      );
    }
  };

  const saveMonitoringFrequency = () => {
    // default value for Monitoring Frequency
    let frequency = 2;
    // alert if input is not a number
    if (isNaN(Number(monitoringFrequency)))
      alert("Please enter monitoring frequency in numerical format. ex: 15");
    else {
      query(
        queryType.INSERT_MONITORING_FREQUENCY,
        ["admin", monitoringFrequency],
        (err, res) => {
          if (err) {
            console.log(`INSERT_MONITORING_FREQUENCY. Error: ${err}`);
          } else {
            console.log(`*** Inserted ${res} into users table. ***`);
            addMonitoringFrequency(monitoringFrequency);
          }
        }
      );
    }
  };

  return (
    <div>
      <p className={classes.description}>
        Allows you to (i) customize the frequency at which we monitor your
        Docker container metrics and (ii), customize the frequency at which we
        resend a notification for an outstanding container event.
      </p>
      <div></div>
      <div>
        <form className={classes.root} autoComplete="off">
          <TextField
            className={classes.textfield}
            id="textfield"
            label="Monitoring Frequency (min)"
            helperText="* 2 min is recommended"
            variant="outlined"
            value={monitoringFrequency}
            onChange={(e) => {
              addMonitoringFrequency(e.target.value);
            }}
            size="small"
          />
          <Button
            className={classes.button}
            size="medium"
            variant="contained"
            onClick={(e) => saveMonitoringFrequency(monitoringFrequency)}
          >
            Confirm
          </Button>
        </form>

        <form className={classes.root} autoComplete="off">
          <TextField
            id="textfield"
            label="Notification Frequency (min)"
            helperText="* 5 min is recommended"
            variant="outlined"
            value={notificationFrequency}
            onChange={(e) => {
              addNotificationFrequency(e.target.value);
            }}
            size="small"
          />
          <Button
            className={classes.button}
            size="medium"
            variant="contained"
            onClick={(e) => saveNotificationFrequency(notificationFrequency)}
          >
            Confirm
          </Button>
        </form>
      </div>
    </div>
  );
};

export default IntervalInput;
